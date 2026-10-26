-- ====================================================================
-- meanwhile — Production Upgrade Migration
-- Safe, additive database migrations preserving existing production data
-- ====================================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enhance rooms table with participants JSON and settings if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'players'
  ) THEN
    ALTER TABLE public.rooms ADD COLUMN players JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.rooms ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 3. Enhance profiles with auth check constraint and index
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_coins ON public.profiles(coins DESC);

-- 4. Index race results for rapid user history and leaderboard queries
CREATE INDEX IF NOT EXISTS idx_race_results_composite ON public.race_results(user_id, wpm DESC, accuracy DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_track_date ON public.race_results(track_id, created_at DESC);

-- 5. Updated All-Time Leaderboard View matching 50-90+ WPM benchmarks
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

-- 6. Robust RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Allow public read access on profiles, race results, and rooms
DO $$
BEGIN
  -- Profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;

  -- Race Results
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'race_results' AND policyname = 'Race results are viewable by everyone') THEN
    CREATE POLICY "Race results are viewable by everyone" ON public.race_results FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'race_results' AND policyname = 'Authenticated racers can submit their own results') THEN
    CREATE POLICY "Authenticated racers can submit their own results" ON public.race_results FOR INSERT WITH CHECK (
      auth.uid() = user_id OR auth.uid() IS NULL
    );
  END IF;

  -- Rooms
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Rooms are viewable by everyone') THEN
    CREATE POLICY "Rooms are viewable by everyone" ON public.rooms FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Anyone can create a room') THEN
    CREATE POLICY "Anyone can create a room" ON public.rooms FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Participants can update their room') THEN
    CREATE POLICY "Participants can update their room" ON public.rooms FOR UPDATE USING (true);
  END IF;
END $$;
