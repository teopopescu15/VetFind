-- Migration 014: Allow multiple reviews per user per company
-- Removes the unique constraint that enforces one review per (company_id, user_id)

-- Drop the unique constraint if it exists
ALTER TABLE IF EXISTS reviews DROP CONSTRAINT IF EXISTS unique_user_company_review;

-- Optionally ensure we still have an index for company lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_reviews_company' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_reviews_company ON reviews(company_id);
  END IF;
END
$$;
