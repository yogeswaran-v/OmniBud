-- Streak tracking for retention
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE;
