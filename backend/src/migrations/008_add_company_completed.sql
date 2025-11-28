-- Migration: Add company_completed flag to companies table
-- Description: Adds a boolean flag to track whether a company has completed the full 4-step registration process
-- Author: Claude Code
-- Date: 2025-11-27

-- Add company_completed column
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_completed BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on completion status
CREATE INDEX IF NOT EXISTS idx_companies_completed ON companies(company_completed);

-- Add comment for documentation
COMMENT ON COLUMN companies.company_completed IS 'Indicates if the company has completed the full 4-step registration process';

-- Update existing companies to set completed = true if they have all required fields
UPDATE companies
SET company_completed = TRUE
WHERE name IS NOT NULL
  AND email IS NOT NULL
  AND phone IS NOT NULL
  AND address IS NOT NULL
  AND city IS NOT NULL
  AND opening_hours IS NOT NULL;
