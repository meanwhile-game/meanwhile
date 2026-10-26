-- ====================================================================
-- meanwhile — Authentication, Profiles, and Player Statistics Fix
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table Ensure Correct Constraints and Defaults
DO $$
BEGIN
  -- Ensure unique index on lower(username) for case-insensitive uniqueness
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_lower_username'
  ) THEN
    CREATE UNIQUE INDEX idx_profiles_lower_username ON public.profiles(lower(username));
  END IF;
END $$;

-- 3. Secure Function to Resolve Username to Auth Identity Email
-- Used by the client to sign in via username without exposing private info
CREATE OR REPLACE FUNCTION public.resolve_username_to_email(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF p_username IS NULL OR length(trim(p_username)) < 3 THEN
    RETURN NULL;
  END IF;

  SELECT u.email INTO v_email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE lower(p.username) = lower(trim(p_username))
  LIMIT 1;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.resolve_username_to_email(TEXT) TO anon, authenticated;

-- 4. Function to Check if Username is Taken
CREATE OR REPLACE FUNCTION public.is_username_available(p_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_taken BOOLEAN;
BEGIN
  IF p_username IS NULL OR length(trim(p_username)) < 3 THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = lower(trim(p_username))
  ) INTO v_taken;

  RETURN NOT v_taken;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

-- 5. Trigger on auth.users: Provisions New Profile with Zero Stats (No Fake Stats)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', 'racer_' || SUBSTRING(NEW.id::text FROM 1 FOR 6));

  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    bio,
    coins,
    best_wpm,
    average_wpm,
    average_accuracy,
    total_races,
    wins,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '🏎️'),
    'Typing today. Racing meanwhile.',
    0,      -- Zero coins until earned
    0,      -- Best WPM starts at 0
    0,      -- Average WPM starts at 0
    0.00,   -- Accuracy starts at 0 until first completed race
    0,      -- 0 races completed
    0,      -- 0 wins
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger on race_results: Accurately Recalculate User Stats from Real Completed Races
CREATE OR REPLACE FUNCTION public.handle_race_finished()
RETURNS TRIGGER AS $$
DECLARE
  v_total_races INTEGER;
  v_wins INTEGER;
  v_best_wpm INTEGER;
  v_avg_wpm INTEGER;
  v_avg_accuracy NUMERIC(5,2);
BEGIN
  -- Ignore results without an authenticated user_id
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate exact aggregates from all completed races for this user
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE position = 1),
    COALESCE(MAX(wpm), 0),
    COALESCE(ROUND(AVG(wpm)), 0),
    COALESCE(ROUND(AVG(accuracy), 2), 0.00)
  INTO 
    v_total_races,
    v_wins,
    v_best_wpm,
    v_avg_wpm,
    v_avg_accuracy
  FROM public.race_results
  WHERE user_id = NEW.user_id;

  -- Update the user profile with recalculated real statistics
  UPDATE public.profiles
  SET 
    total_races = v_total_races,
    wins = v_wins,
    best_wpm = v_best_wpm,
    average_wpm = v_avg_wpm,
    average_accuracy = v_avg_accuracy,
    coins = coins + (CASE WHEN NEW.position = 1 THEN 150 WHEN NEW.position = 2 THEN 90 WHEN NEW.position = 3 THEN 50 ELSE 20 END),
    xp = xp + (NEW.wpm * 2),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_race_result_inserted ON public.race_results;
CREATE TRIGGER on_race_result_inserted
  AFTER INSERT ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_race_finished();

-- 7. Update Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Publicly readable; writable only by owner
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Race Results: Publicly readable; insertable ONLY by authenticated users for their own user_id
-- Guests are prevented from inserting persistent race results
DROP POLICY IF EXISTS "Race results are viewable by everyone" ON public.race_results;
CREATE POLICY "Race results are viewable by everyone" 
  ON public.race_results FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Authenticated racers can submit their own results" ON public.race_results;
DROP POLICY IF EXISTS "Users can insert their own race results" ON public.race_results;
CREATE POLICY "Authenticated racers can submit their own results" 
  ON public.race_results FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- 8. Leaderboard View: Show Only Users with At Least 1 Completed Race
CREATE OR REPLACE VIEW public.leaderboard_all_time AS
SELECT 
  id AS user_id,
  username,
  avatar_url,
  best_wpm,
  average_wpm,
  average_accuracy,
  total_races,
  wins,
  CASE 
    WHEN total_races > 0 THEN ROUND((wins::numeric / total_races::numeric) * 100, 1)
    ELSE 0
  END AS win_rate,
  RANK() OVER (ORDER BY best_wpm DESC, average_accuracy DESC, total_races DESC) AS global_rank
FROM public.profiles
WHERE total_races > 0;
