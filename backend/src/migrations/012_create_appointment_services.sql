-- Migration: Create appointment_services and add totals to appointments
-- Adds a join table to snapshot per-service pricing/duration at booking time

CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id INTEGER NULL,
  service_name TEXT,
  price_min NUMERIC,
  price_max NUMERIC,
  duration_minutes INTEGER,
  price_at_booking NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add aggregate columns to appointments for quick reads
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS total_price_min NUMERIC,
  ADD COLUMN IF NOT EXISTS total_price_max NUMERIC,
  ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER;

-- Index to quickly fetch services for an appointment
CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment_id ON appointment_services(appointment_id);
