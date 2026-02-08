-- Migration 020: Add category and sub-ratings to reviews (backward compatible)
-- New fields: category (pisica/caine/pasare/altele), professionalism, efficiency, friendliness (1-5)
-- Existing rows get: category = 'altele', professionalism = 5, efficiency = 5, friendliness = 5

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'altele';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS professionalism INTEGER DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS efficiency INTEGER DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS friendliness INTEGER DEFAULT 5;

-- Constrain valid values for new rating columns
ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS check_review_professionalism;
ALTER TABLE reviews
  ADD CONSTRAINT check_review_professionalism CHECK (professionalism >= 1 AND professionalism <= 5);

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS check_review_efficiency;
ALTER TABLE reviews
  ADD CONSTRAINT check_review_efficiency CHECK (efficiency >= 1 AND efficiency <= 5);

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS check_review_friendliness;
ALTER TABLE reviews
  ADD CONSTRAINT check_review_friendliness CHECK (friendliness >= 1 AND friendliness <= 5);

-- Backfill existing rows (in case columns were added without DEFAULT in a previous run)
UPDATE reviews
SET
  category = COALESCE(category, 'altele'),
  professionalism = COALESCE(professionalism, 5),
  efficiency = COALESCE(efficiency, 5),
  friendliness = COALESCE(friendliness, 5)
WHERE category IS NULL OR professionalism IS NULL OR efficiency IS NULL OR friendliness IS NULL;

COMMENT ON COLUMN reviews.category IS 'Pet category: pisica, caine, pasare, altele';
COMMENT ON COLUMN reviews.professionalism IS 'Professionalism rating 1-5';
COMMENT ON COLUMN reviews.efficiency IS 'Efficiency rating 1-5';
COMMENT ON COLUMN reviews.friendliness IS 'Friendliness rating 1-5';
