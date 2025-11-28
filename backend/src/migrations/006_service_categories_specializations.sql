-- Migration: Create service_categories and category_specializations tables
-- Description: Hierarchical category-specialization system for vet services

-- Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category Specializations Table
CREATE TABLE IF NOT EXISTS category_specializations (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  suggested_duration_minutes INTEGER DEFAULT 30,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, name)
);

-- Update company_services to reference specializations
-- Note: price_min and price_max columns already exist in company_services (see migration 004)

-- Make the old category column nullable (backward compatibility with old schema)
ALTER TABLE company_services
  ALTER COLUMN category DROP NOT NULL;

-- Add specialization_id column
ALTER TABLE company_services
  ADD COLUMN IF NOT EXISTS specialization_id INTEGER REFERENCES category_specializations(id) ON DELETE SET NULL;

-- Seed initial data
INSERT INTO service_categories (name, description, icon, display_order) VALUES
  ('Routine Care', 'Regular checkups and preventive care', 'medical', 1),
  ('Dental Care', 'Oral health and dental procedures', 'fitness', 2),
  ('Diagnostic Services', 'Lab work, imaging, and diagnostics', 'flask', 3),
  ('Emergency Care', 'Urgent and emergency services', 'warning', 4),
  ('Surgical Procedures', 'Surgical operations and interventions', 'cut', 5),
  ('Grooming', 'Pet grooming and hygiene services', 'sparkles', 6);

-- Seed specializations for each category
-- Routine Care (category_id = 1)
INSERT INTO category_specializations (category_id, name, description, suggested_duration_minutes, display_order) VALUES
  (1, 'General Checkup', 'Complete physical examination', 30, 1),
  (1, 'Vaccination', 'Vaccine administration', 15, 2),
  (1, 'Flea/Tick Prevention', 'Monthly prevention treatment', 10, 3),
  (1, 'Deworming', 'Parasite treatment', 10, 4),
  (1, 'Nail Trimming', 'Nail care service', 15, 5),
  (1, 'Microchipping', 'Permanent identification', 20, 6);

-- Dental Care (category_id = 2)
INSERT INTO category_specializations (category_id, name, description, suggested_duration_minutes, display_order) VALUES
  (2, 'Dental Checkup', 'Oral health examination', 30, 1),
  (2, 'Teeth Cleaning', 'Professional dental cleaning', 90, 2),
  (2, 'Tooth Extraction', 'Surgical tooth removal', 120, 3),
  (2, 'Dental X-Ray', 'Dental radiographs', 30, 4);

-- Diagnostic Services (category_id = 3)
INSERT INTO category_specializations (category_id, name, description, suggested_duration_minutes, display_order) VALUES
  (3, 'Blood Test (Basic)', 'Complete blood count', 30, 1),
  (3, 'Blood Test (Comprehensive)', 'Full panel analysis', 30, 2),
  (3, 'X-Ray', 'Radiographic imaging', 45, 3),
  (3, 'Ultrasound', 'Ultrasound imaging', 60, 4),
  (3, 'Urinalysis', 'Urine analysis', 20, 5),
  (3, 'Fecal Exam', 'Stool sample analysis', 15, 6);

-- Emergency Care (category_id = 4)
INSERT INTO category_specializations (category_id, name, description, suggested_duration_minutes, display_order) VALUES
  (4, 'Emergency Consultation', 'Immediate assessment', 30, 1),
  (4, 'Emergency Surgery', 'Urgent surgical intervention', 180, 2),
  (4, 'Overnight Hospitalization', 'Inpatient monitoring', 1440, 3),
  (4, 'Wound Treatment', 'Emergency wound care', 45, 4),
  (4, 'Poison Treatment', 'Toxin exposure treatment', 120, 5);

-- Surgical Procedures (category_id = 5)
INSERT INTO category_specializations (category_id, name, description, suggested_duration_minutes, display_order) VALUES
  (5, 'Spay (Cat)', 'Feline spay surgery', 60, 1),
  (5, 'Spay (Dog)', 'Canine spay surgery', 90, 2),
  (5, 'Neuter (Cat)', 'Feline neuter surgery', 45, 3),
  (5, 'Neuter (Dog)', 'Canine neuter surgery', 60, 4),
  (5, 'Soft Tissue Surgery', 'Non-orthopedic procedures', 120, 5),
  (5, 'Orthopedic Surgery', 'Bone and joint surgery', 180, 6),
  (5, 'Tumor Removal', 'Mass excision surgery', 120, 7);

-- Grooming (category_id = 6)
INSERT INTO category_specializations (category_id, name, description, suggested_duration_minutes, display_order) VALUES
  (6, 'Bath & Brush', 'Basic bathing service', 60, 1),
  (6, 'Full Grooming', 'Complete grooming package', 120, 2),
  (6, 'Haircut/Trim', 'Coat trimming and styling', 60, 3),
  (6, 'Ear Cleaning', 'Ear care service', 15, 4),
  (6, 'Anal Gland Expression', 'Gland expression service', 15, 5);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_category_specializations_category_id ON category_specializations(category_id);
CREATE INDEX IF NOT EXISTS idx_company_services_specialization_id ON company_services(specialization_id);

-- Create trigger for service_categories updated_at
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_categories_updated_at_trigger
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();

-- Create trigger for category_specializations updated_at
CREATE OR REPLACE FUNCTION update_category_specializations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER category_specializations_updated_at_trigger
  BEFORE UPDATE ON category_specializations
  FOR EACH ROW
  EXECUTE FUNCTION update_category_specializations_updated_at();

-- Add comments for documentation
COMMENT ON TABLE service_categories IS 'Master list of service categories for vet clinics';
COMMENT ON TABLE category_specializations IS 'Specializations within each service category';
COMMENT ON COLUMN category_specializations.suggested_duration_minutes IS 'Default duration suggestion for this specialization';
COMMENT ON COLUMN company_services.specialization_id IS 'Reference to category_specializations for pre-defined services (NULL for custom services)';
