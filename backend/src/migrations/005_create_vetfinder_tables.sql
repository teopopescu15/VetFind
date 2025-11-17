-- Migration: Create VetFinder tables (clinics, services, reviews, appointments)
-- Description: PostgreSQL version of VetFinder schema

-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_hours JSONB,
  photo_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for clinics
CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_owner ON clinics(owner_id);
CREATE INDEX IF NOT EXISTS idx_clinics_location ON clinics(latitude, longitude);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for services
CREATE INDEX IF NOT EXISTS idx_services_clinic ON services(clinic_id);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (clinic_id, user_id)
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_clinics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER clinics_updated_at_trigger
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_clinics_updated_at();

CREATE TRIGGER services_updated_at_trigger
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

CREATE TRIGGER reviews_updated_at_trigger
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

CREATE TRIGGER appointments_updated_at_trigger
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Add comments
COMMENT ON TABLE clinics IS 'Veterinary clinics for VetFinder app';
COMMENT ON TABLE services IS 'Services offered by clinics';
COMMENT ON TABLE reviews IS 'User reviews for clinics';
COMMENT ON TABLE appointments IS 'User appointments with clinics';
