-- Migration: Romanian Localization
-- Update company address structure for Romanian format
-- Date: 2025-11-26

-- Add new Romanian address fields
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS street VARCHAR(255),
ADD COLUMN IF NOT EXISTS street_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS building VARCHAR(20),
ADD COLUMN IF NOT EXISTS apartment VARCHAR(20),
ADD COLUMN IF NOT EXISTS county VARCHAR(2), -- County code (AB, B, CJ, etc.)
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS cui VARCHAR(20);

-- Migrate existing address data (if companies table has data)
-- Copy old 'address' field to new 'street' field
UPDATE companies
SET street = address
WHERE street IS NULL AND address IS NOT NULL;

-- Remove deprecated American fields
-- Note: We keep them temporarily with default values for backwards compatibility
-- They can be fully removed in a future migration after data migration is complete
ALTER TABLE companies
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN zip_code DROP NOT NULL;

-- Update existing data to have default county (București)
UPDATE companies
SET county = 'B' -- București as default
WHERE county IS NULL;

-- Make new Romanian fields NOT NULL (after data migration)
-- Commented out for now to allow gradual migration
-- ALTER TABLE companies
-- ALTER COLUMN street SET NOT NULL,
-- ALTER COLUMN street_number SET NOT NULL,
-- ALTER COLUMN city SET NOT NULL,
-- ALTER COLUMN county SET NOT NULL,
-- ALTER COLUMN postal_code SET NOT NULL;

-- Add check constraints for Romanian format validation
-- Use DO blocks to handle existing constraints gracefully
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_county_code'
  ) THEN
    ALTER TABLE companies
    ADD CONSTRAINT check_county_code
      CHECK (county IS NULL OR county ~ '^[A-Z]{1,2}$');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_postal_code'
  ) THEN
    ALTER TABLE companies
    ADD CONSTRAINT check_postal_code
      CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{6}$');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_phone_romanian_format'
  ) THEN
    ALTER TABLE companies
    ADD CONSTRAINT check_phone_romanian_format
      CHECK (phone IS NULL OR phone ~ '^\+40[0-9]{9}$' OR phone ~ '^07[0-9]{8}$');
  END IF;
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_companies_county ON companies(county);
CREATE INDEX IF NOT EXISTS idx_companies_postal_code ON companies(postal_code);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);

-- Add comments for documentation
COMMENT ON COLUMN companies.street IS 'Romanian street name (Strada)';
COMMENT ON COLUMN companies.street_number IS 'Street number (Număr)';
COMMENT ON COLUMN companies.building IS 'Building number (Bloc) - optional';
COMMENT ON COLUMN companies.apartment IS 'Apartment number (Apartament) - optional';
COMMENT ON COLUMN companies.county IS 'Romanian county code (Județ) - 2 letter code (e.g., B, CJ, AB)';
COMMENT ON COLUMN companies.postal_code IS 'Romanian postal code - 6 digits (XXXXXX)';
COMMENT ON COLUMN companies.cui IS 'CUI - Cod Unic de Înregistrare (Romanian Tax ID)';

-- Update phone column comment
COMMENT ON COLUMN companies.phone IS 'Romanian phone format: +40 XXX XXX XXX or 07XX XXX XXX';
