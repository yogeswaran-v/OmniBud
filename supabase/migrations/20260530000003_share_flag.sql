-- Add opt-in sharing flag to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS jobs_is_shared_idx ON public.jobs (is_shared) WHERE is_shared = true;
