-- Migration: Create companies table for vet clinic profiles
-- Description: Stores comprehensive vet company information including location, services, and media

-- Create enum for clinic types
CREATE TYPE clinic_type AS ENUM (
  'general_practice',
  'emergency_care',
  'specialized_care',
  'mobile_vet',
  'emergency_24_7'
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  description TEXT,

  -- Location Information
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Business Details
  clinic_type clinic_type NOT NULL DEFAULT 'general_practice',
  years_in_business INTEGER,
  num_veterinarians INTEGER,

  -- Media
  logo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,

  -- Arrays for multi-select fields
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  facilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  payment_methods TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Opening Hours (JSONB structure for flexibility)
  -- Format: {"monday": {"open": "09:00", "close": "17:00", "closed": false}, ...}
  opening_hours JSONB DEFAULT '{}'::jsonb,

  -- Status and Verification
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_state ON companies(state);
CREATE INDEX idx_companies_clinic_type ON companies(clinic_type);
CREATE INDEX idx_companies_is_active ON companies(is_active);
CREATE INDEX idx_companies_location ON companies(latitude, longitude);
CREATE INDEX idx_companies_specializations ON companies USING GIN(specializations);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at_trigger
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Stores vet clinic/company profiles for users with role=vetcompany';
COMMENT ON COLUMN companies.user_id IS 'Foreign key to users table, one user can have one company';
COMMENT ON COLUMN companies.opening_hours IS 'Day-wise schedule in JSONB format';
COMMENT ON COLUMN companies.photos IS 'Array of photo URLs in JSONB format';
COMMENT ON COLUMN companies.specializations IS 'Array of animal types and services offered';
COMMENT ON COLUMN companies.facilities IS 'Array of available facilities and amenities';
COMMENT ON COLUMN companies.payment_methods IS 'Array of accepted payment methods';
COMMENT ON COLUMN companies.is_verified IS 'Admin verification status for trust badge';
COMMENT ON COLUMN companies.is_active IS 'Soft delete flag, inactive companies hidden from search';
