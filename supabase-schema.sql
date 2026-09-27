-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.jobs (
    id text PRIMARY KEY,
    title text NOT NULL,
    company text NOT NULL,
    location text,
    remote boolean DEFAULT false,
    employment_type text,
    description text,
    salary_min numeric,
    salary_max numeric,
    salary_currency text,
    salary_display text,
    posted_at timestamptz,
    apply_url text NOT NULL,
    source text NOT NULL,
    source_job_id text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    skills text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for common searches
CREATE INDEX IF NOT EXISTS idx_jobs_company ON public.jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);

-- User Projects Table
CREATE TABLE IF NOT EXISTS public.user_projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    tech_stack text[] DEFAULT '{}',
    link text,
    github text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS and add policy so users can manage their own projects
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own projects" ON public.user_projects;
CREATE POLICY "Users can manage their own projects" 
ON public.user_projects 
FOR ALL 
USING (auth.uid() = user_id);

-- Application Activity Table for Dashboard Trends
CREATE TABLE IF NOT EXISTS public.application_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title text NOT NULL,
    company_name text NOT NULL,
    status text NOT NULL DEFAULT 'Applied', -- 'Applied', 'Interview', etc.
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for application activity
ALTER TABLE public.application_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own application activity" ON public.application_activity;
CREATE POLICY "Users can manage their own application activity" 
ON public.application_activity 
FOR ALL 
USING (auth.uid() = user_id);

-- Saved Jobs Table for Cloud Sync
CREATE TABLE IF NOT EXISTS public.user_saved_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id text NOT NULL,
    job_data jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, job_id)
);

ALTER TABLE public.user_saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own saved jobs" ON public.user_saved_jobs;
CREATE POLICY "Users can manage their own saved jobs" 
ON public.user_saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Applied Jobs Table for Cloud Sync
CREATE TABLE IF NOT EXISTS public.user_applied_jobs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id text NOT NULL,
    job_data jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, job_id)
);

ALTER TABLE public.user_applied_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own applied jobs" ON public.user_applied_jobs;
CREATE POLICY "Users can manage their own applied jobs" 
ON public.user_applied_jobs FOR ALL USING (auth.uid() = user_id);
