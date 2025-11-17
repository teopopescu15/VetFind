-- Migration: Create company_services table for vet services and pricing
-- Description: Stores individual services offered by vet companies with pricing information

-- Create enum for service categories
CREATE TYPE service_category AS ENUM (
  'routine_care',
  'dental_care',
  'diagnostic_services',
  'emergency_care',
  'surgical_procedures',
  'grooming',
  'custom'
);

-- Create company_services table
CREATE TABLE IF NOT EXISTS company_services (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Service Information
  category service_category NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing
  price_min DECIMAL(10, 2) NOT NULL CHECK (price_min >= 0),
  price_max DECIMAL(10, 2) NOT NULL CHECK (price_max >= price_min),

  -- Duration (in minutes, optional)
  duration_minutes INTEGER CHECK (duration_minutes > 0),

  -- Custom service flag (for user-created services outside predefined categories)
  is_custom BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_company_services_company_id ON company_services(company_id);
CREATE INDEX idx_company_services_category ON company_services(category);
CREATE INDEX idx_company_services_is_active ON company_services(is_active);
CREATE INDEX idx_company_services_is_custom ON company_services(is_custom);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_services_updated_at_trigger
  BEFORE UPDATE ON company_services
  FOR EACH ROW
  EXECUTE FUNCTION update_company_services_updated_at();

-- Add comments for documentation
COMMENT ON TABLE company_services IS 'Stores services and pricing for vet companies';
COMMENT ON COLUMN company_services.company_id IS 'Foreign key to companies table';
COMMENT ON COLUMN company_services.category IS 'Pre-defined service category or custom';
COMMENT ON COLUMN company_services.price_min IS 'Minimum price for service (starting at)';
COMMENT ON COLUMN company_services.price_max IS 'Maximum price for service (up to)';
COMMENT ON COLUMN company_services.duration_minutes IS 'Estimated service duration in minutes';
COMMENT ON COLUMN company_services.is_custom IS 'TRUE if user-created service, FALSE if from predefined list';
COMMENT ON COLUMN company_services.is_active IS 'Soft delete flag for discontinued services';
