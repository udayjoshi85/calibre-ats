-- Migration: 002_add_signal_evidence.sql
-- Add signal_evidence column to store evidence for each signal score

ALTER TABLE analysis_results
ADD COLUMN IF NOT EXISTS signal_evidence JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN analysis_results.signal_evidence IS 'JSON object containing evidence arrays for each signal score, e.g., {"technical_skills": ["Built ETL pipeline", "Used Snowflake in production"]}';
