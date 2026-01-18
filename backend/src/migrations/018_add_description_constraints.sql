-- Migration: Add description length constraint
-- Description: Enforce 5-100 character limit for clinic descriptions

-- Add CHECK constraint for description length (5-100 chars)
ALTER TABLE companies
  ADD CONSTRAINT companies_description_length
  CHECK (description IS NULL OR (char_length(description) >= 5 AND char_length(description) <= 100));

-- Add column comment for documentation
COMMENT ON COLUMN companies.description IS 'Clinic description: 5-100 characters, nullable';
