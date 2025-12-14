-- Migration: Create Appointments and Reviews Tables for New Companies System
-- Description: Recreate appointments and reviews functionality using the companies system
--
-- Context: Migration 009 removed the legacy clinic system (clinics, services, reviews, appointments)
--          This migration recreates appointments and reviews but references the NEW system:
--          - companies table (instead of clinics)
--          - company_services table (instead of services)
--
-- This allows the appointment booking feature to work with the modern companies architecture.
--
-- Created: 2025-12-14
-- =============================================================================

-- =============================================================================
-- Step 1: Create appointment_status ENUM type
-- =============================================================================

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

COMMENT ON TYPE appointment_status IS 'Appointment status lifecycle: pending → confirmed/cancelled → completed';

-- =============================================================================
-- Step 2: Create appointments table
-- =============================================================================

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,

    -- Foreign Keys (NEW system references)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES company_services(id) ON DELETE SET NULL,

    -- Appointment Details
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'pending' NOT NULL,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_appointment_date_future CHECK (appointment_date > created_at),
    CONSTRAINT check_appointment_date_reasonable CHECK (appointment_date < CURRENT_TIMESTAMP + INTERVAL '1 year')
);

-- Indexes for appointments
CREATE INDEX idx_appointments_company ON appointments(company_id);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_user_status ON appointments(user_id, status);
CREATE INDEX idx_appointments_company_date ON appointments(company_id, appointment_date);

-- Comments for appointments table
COMMENT ON TABLE appointments IS 'User appointments with vet companies for specific services';
COMMENT ON COLUMN appointments.company_id IS 'References companies table (the vet clinic/company)';
COMMENT ON COLUMN appointments.user_id IS 'References users table (the pet owner)';
COMMENT ON COLUMN appointments.service_id IS 'References company_services table (the booked service) - nullable if service deleted';
COMMENT ON COLUMN appointments.appointment_date IS 'Scheduled appointment date and time (with timezone)';
COMMENT ON COLUMN appointments.status IS 'Current appointment status: pending, confirmed, cancelled, or completed';
COMMENT ON COLUMN appointments.notes IS 'Optional notes from user about the appointment (pet info, special requests, etc.)';

-- =============================================================================
-- Step 3: Create reviews table
-- =============================================================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,

    -- Foreign Keys (NEW system references)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Review Details
    rating INTEGER NOT NULL,
    comment TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT unique_user_company_review UNIQUE (company_id, user_id)
);

-- Indexes for reviews
CREATE INDEX idx_reviews_company ON reviews(company_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_company_rating ON reviews(company_id, rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Comments for reviews table
COMMENT ON TABLE reviews IS 'User reviews and ratings for vet companies';
COMMENT ON COLUMN reviews.company_id IS 'References companies table (the reviewed vet clinic/company)';
COMMENT ON COLUMN reviews.user_id IS 'References users table (the reviewer)';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars (inclusive)';
COMMENT ON COLUMN reviews.comment IS 'Optional text review/comment from the user';
COMMENT ON CONSTRAINT unique_user_company_review ON reviews IS 'One review per user per company (users can update existing review)';

-- =============================================================================
-- Step 4: Create trigger functions for updated_at columns
-- =============================================================================

-- Trigger function for appointments.updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_appointments_updated_at() IS 'Auto-update updated_at timestamp for appointments table';

-- Trigger function for reviews.updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_reviews_updated_at() IS 'Auto-update updated_at timestamp for reviews table';

-- =============================================================================
-- Step 5: Create triggers
-- =============================================================================

-- Trigger for appointments
CREATE TRIGGER appointments_updated_at_trigger
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

COMMENT ON TRIGGER appointments_updated_at_trigger ON appointments IS 'Automatically updates updated_at on row modification';

-- Trigger for reviews
CREATE TRIGGER reviews_updated_at_trigger
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

COMMENT ON TRIGGER reviews_updated_at_trigger ON reviews IS 'Automatically updates updated_at on row modification';

-- =============================================================================
-- Step 6: Create view for appointments with joined company/service data
-- =============================================================================

CREATE OR REPLACE VIEW appointments_with_details AS
SELECT
    a.id,
    a.company_id,
    a.user_id,
    a.service_id,
    a.appointment_date,
    a.status,
    a.notes,
    a.created_at,
    a.updated_at,

    -- User details
    u.name AS user_name,
    u.email AS user_email,

    -- Company details
    c.name AS company_name,
    c.phone AS company_phone,
    c.email AS company_email,
    COALESCE(
        CONCAT_WS(', ',
            NULLIF(CONCAT_WS(' ', c.street, c.street_number, c.building, c.apartment), ''),
            c.city,
            c.county,
            c.postal_code
        ),
        c.address  -- Fallback to old address field if new fields are null
    ) AS company_address,

    -- Service details
    cs.service_name,
    cs.price_min AS service_price_min,
    cs.price_max AS service_price_max,
    cs.duration_minutes AS service_duration

FROM appointments a
INNER JOIN users u ON a.user_id = u.id
INNER JOIN companies c ON a.company_id = c.id
LEFT JOIN company_services cs ON a.service_id = cs.id;

COMMENT ON VIEW appointments_with_details IS 'Appointments with joined user, company, and service details for easy querying';

-- =============================================================================
-- Step 7: Create view for company review statistics
-- =============================================================================

CREATE OR REPLACE VIEW company_review_stats AS
SELECT
    c.id AS company_id,
    c.name AS company_name,
    COUNT(r.id) AS review_count,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0) AS five_star_count,
    COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), 0) AS four_star_count,
    COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), 0) AS three_star_count,
    COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), 0) AS two_star_count,
    COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), 0) AS one_star_count,
    MAX(r.created_at) AS latest_review_date
FROM companies c
LEFT JOIN reviews r ON c.id = r.company_id
GROUP BY c.id, c.name;

COMMENT ON VIEW company_review_stats IS 'Aggregated review statistics for each company (rating average, count, distribution)';

-- =============================================================================
-- Step 8: Verification and Summary
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Appointments and Reviews tables CREATED successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  ✅ appointments (references companies, users, company_services)';
  RAISE NOTICE '  ✅ reviews (references companies, users)';
  RAISE NOTICE '';
  RAISE NOTICE 'Created types:';
  RAISE NOTICE '  ✅ appointment_status ENUM';
  RAISE NOTICE '';
  RAISE NOTICE 'Created functions:';
  RAISE NOTICE '  ✅ update_appointments_updated_at()';
  RAISE NOTICE '  ✅ update_reviews_updated_at()';
  RAISE NOTICE '';
  RAISE NOTICE 'Created triggers:';
  RAISE NOTICE '  ✅ appointments_updated_at_trigger';
  RAISE NOTICE '  ✅ reviews_updated_at_trigger';
  RAISE NOTICE '';
  RAISE NOTICE 'Created views:';
  RAISE NOTICE '  ✅ appointments_with_details (joins user, company, service)';
  RAISE NOTICE '  ✅ company_review_stats (aggregated ratings)';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created: 13 total';
  RAISE NOTICE '  - appointments: 7 indexes';
  RAISE NOTICE '  - reviews: 6 indexes';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Schema Compatibility:';
  RAISE NOTICE '  ✅ appointments.company_id → companies.id (NOT clinics.id)';
  RAISE NOTICE '  ✅ appointments.service_id → company_services.id (NOT services.id)';
  RAISE NOTICE '  ✅ reviews.company_id → companies.id (NOT clinics.id)';
  RAISE NOTICE '========================================';
END $$;

-- =============================================================================
-- Migration Complete
-- =============================================================================
-- The appointment booking feature should now work with the companies system.
--
-- Next Steps:
-- 1. Verify backend code references company_id (not clinic_id) in appointment models
-- 2. Test appointment creation API endpoint
-- 3. Test review creation API endpoint
-- 4. Verify frontend can book appointments and submit reviews
-- =============================================================================
