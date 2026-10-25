-- Meanwhile: 3D Multiplayer Typing Racing Platform
-- Supabase PostgreSQL Migration: Schema, Indexes, Views, and Row Level Security (RLS)

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '🏎️',
  bio TEXT DEFAULT 'Typing today. Racing meanwhile.',
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  coins INTEGER DEFAULT 2450 CHECK (coins >= 0),
  equipped_vehicle_id TEXT DEFAULT 'vortex',
  equipped_vehicle_paint TEXT DEFAULT '#f8fafc',
  best_wpm INTEGER DEFAULT 0 CHECK (best_wpm >= 0),
  average_wpm INTEGER DEFAULT 0 CHECK (average_wpm >= 0),
  average_accuracy NUMERIC(5,2) DEFAULT 100.00 CHECK (average_accuracy >= 0 AND average_accuracy <= 100),
  total_races INTEGER DEFAULT 0 CHECK (total_races >= 0),
  wins INTEGER DEFAULT 0 CHECK (wins >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast username queries and leaderboard lookups
CREATE INDEX IF NOT EXISTS idx_profiles_best_wpm ON public.profiles(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 3. Race Results Table
CREATE TABLE IF NOT EXISTS public.race_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  track_id TEXT NOT NULL,
  game_mode TEXT NOT NULL DEFAULT 'quick_race',
  vehicle_id TEXT NOT NULL DEFAULT 'vortex',
  wpm INTEGER NOT NULL CHECK (wpm >= 0 AND wpm <= 350),
  accuracy NUMERIC(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  time_seconds NUMERIC(8,2) NOT NULL CHECK (time_seconds > 0),
  position INTEGER NOT NULL CHECK (position >= 1),
  total_racers INTEGER NOT NULL CHECK (total_racers >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_race_results_user ON public.race_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_track_wpm ON public.race_results(track_id, wpm DESC);
CREATE INDEX IF NOT EXISTS idx_race_results_created_at ON public.race_results(created_at DESC);

-- 4. Multiplayer Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  track_id TEXT NOT NULL DEFAULT 'coastal-drive',
  laps INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'countdown', 'racing', 'finished'
  max_players INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- 5. Leaderboard Views
CREATE OR REPLACE VIEW public.leaderboard_all_time AS
SELECT 
  id AS user_id,
  username,
  avatar_url,
  best_wpm,
  total_races,
  CASE 
    WHEN total_races > 0 THEN ROUND((wins::numeric / total_races::numeric) * 100, 1)
    ELSE 0
  END AS win_rate,
  RANK() OVER (ORDER BY best_wpm DESC, average_accuracy DESC) AS global_rank
FROM public.profiles
WHERE total_races > 0;

-- 6. Trigger to automatically provision profile when an auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    bio,
    coins
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Racer_' || SUBSTRING(NEW.id::text FROM 1 FOR 6)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '🏎️'),
    'Typing today. Racing meanwhile.',
    2450
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Trigger to update user stats on race completion
CREATE OR REPLACE FUNCTION public.handle_race_finished()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_races = total_races + 1,
    wins = wins + (CASE WHEN NEW.position = 1 THEN 1 ELSE 0 END),
    best_wpm = GREATEST(best_wpm, NEW.wpm),
    average_wpm = ROUND((average_wpm * total_races + NEW.wpm)::numeric / (total_races + 1)),
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

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Profiles: Publicly readable; writable only by owner
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Race Results: Publicly readable; insertable by the authenticated runner
CREATE POLICY "Race results are viewable by everyone" 
  ON public.race_results FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own race results" 
  ON public.race_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Rooms: Publicly readable; anyone can create and join
CREATE POLICY "Rooms are viewable by everyone" 
  ON public.rooms FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create a room" 
  ON public.rooms FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Hosts can update their room" 
  ON public.rooms FOR UPDATE 
  USING (true);
