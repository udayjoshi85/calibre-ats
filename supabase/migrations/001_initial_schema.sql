-- Calibre ATS Database Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    resume_url TEXT,
    resume_text TEXT,
    status VARCHAR(50) DEFAULT 'pending',

    -- Extracted Profile Links
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    notion_url TEXT,

    -- Enrichment Data
    github_data JSONB,
    linkedin_data JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('pending', 'analyzing', 'reviewed', 'shortlisted', 'rejected'))
);

-- Analysis Results table
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE UNIQUE,

    -- Overall Score
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),

    -- Individual Signal Scores
    experience_relevance_score INTEGER CHECK (experience_relevance_score >= 0 AND experience_relevance_score <= 100),
    technical_skills_score INTEGER CHECK (technical_skills_score >= 0 AND technical_skills_score <= 100),
    business_impact_score INTEGER CHECK (business_impact_score >= 0 AND business_impact_score <= 100),
    proof_of_work_score INTEGER CHECK (proof_of_work_score >= 0 AND proof_of_work_score <= 100),
    career_growth_score INTEGER CHECK (career_growth_score >= 0 AND career_growth_score <= 100),
    certifications_score INTEGER CHECK (certifications_score >= 0 AND certifications_score <= 100),
    soft_skills_score INTEGER CHECK (soft_skills_score >= 0 AND soft_skills_score <= 100),
    resume_quality_score INTEGER CHECK (resume_quality_score >= 0 AND resume_quality_score <= 100),
    extracurriculars_score INTEGER CHECK (extracurriculars_score >= 0 AND extracurriculars_score <= 100),

    -- Extracted Data
    experience_years INTEGER,
    skills_matched JSONB,
    skills_missing JSONB,
    certifications JSONB,
    education JSONB,
    proof_of_work_links JSONB,

    -- AI Insights
    green_flags JSONB,
    yellow_flags JSONB,
    red_flags JSONB,
    summary TEXT,
    recommendation VARCHAR(50) CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_analysis_results_candidate_id ON analysis_results(candidate_id);
CREATE INDEX idx_analysis_results_overall_score ON analysis_results(overall_score DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for jobs table
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users full access (single tenant)
CREATE POLICY "Allow authenticated access to jobs"
    ON jobs FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to candidates"
    ON candidates FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to analysis_results"
    ON analysis_results FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Storage bucket for resumes (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
