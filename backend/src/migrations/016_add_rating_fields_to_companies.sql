-- Migration 016: Add rating and review_count to companies

-- Add columns with safe IF NOT EXISTS guards
ALTER TABLE IF EXISTS companies
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0 NOT NULL;

-- Backfill any existing rows that might have NULLs (in case columns existed without defaults)
UPDATE companies
SET rating = COALESCE(rating, 0),
    review_count = COALESCE(review_count, 0);
