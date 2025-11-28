-- Migration: Remove Legacy Clinic System (clinics, services, reviews, appointments)
-- Description: Cleanup legacy tables that have been replaced by the new companies system
--
-- Context: The app originally used a "clinics + services" system (migration 005)
--          but was redesigned to use "companies + company_services + hierarchical categories" (migrations 003, 004, 006)
--          Frontend exclusively uses the NEW system. Legacy tables contain only old test data.
--
-- Data Analysis (as of 2025-11-27):
--   OLD System: 11 clinics, 1 service (last activity: Nov 16, mostly test data)
--   NEW System: 13 companies, 15 services (actively used, last activity: TODAY)
--
-- This migration REMOVES the legacy system entirely.
-- WARNING: This will DELETE all data in clinics, services, reviews, and appointments tables!
-- If you need this data, export it BEFORE running this migration.

-- =============================================================================
-- SAFETY CHECK: Display data before deletion
-- =============================================================================

DO $$
DECLARE
  clinics_count INTEGER;
  services_count INTEGER;
  reviews_count INTEGER;
  appointments_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO clinics_count FROM clinics;
  SELECT COUNT(*) INTO services_count FROM services;
  SELECT COUNT(*) INTO reviews_count FROM reviews;
  SELECT COUNT(*) INTO appointments_count FROM appointments;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'LEGACY SYSTEM DATA COUNT:';
  RAISE NOTICE '  Clinics: %', clinics_count;
  RAISE NOTICE '  Services: %', services_count;
  RAISE NOTICE '  Reviews: %', reviews_count;
  RAISE NOTICE '  Appointments: %', appointments_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'This data will be PERMANENTLY DELETED!';
  RAISE NOTICE '========================================';
END $$;

-- =============================================================================
-- Step 1: Drop dependent tables (with CASCADE for safety)
-- =============================================================================

-- Drop appointments table (references services and clinics)
DROP TABLE IF EXISTS appointments CASCADE;
COMMENT ON FUNCTION update_appointments_updated_at() IS 'ORPHANED: Original appointments table removed';

-- Drop reviews table (references clinics)
DROP TABLE IF EXISTS reviews CASCADE;
COMMENT ON FUNCTION update_reviews_updated_at() IS 'ORPHANED: Original reviews table removed';

-- Drop services table (references clinics)
DROP TABLE IF EXISTS services CASCADE;
COMMENT ON FUNCTION update_services_updated_at() IS 'ORPHANED: Original services table removed';

-- Drop clinics table
DROP TABLE IF EXISTS clinics CASCADE;
COMMENT ON FUNCTION update_clinics_updated_at() IS 'ORPHANED: Original clinics table removed';

-- =============================================================================
-- Step 2: Drop related enums and types
-- =============================================================================

-- Drop appointment_status enum (used by appointments table)
DROP TYPE IF EXISTS appointment_status CASCADE;

-- =============================================================================
-- Step 3: Drop orphaned trigger functions
-- =============================================================================

-- These functions were created by migration 005 but are no longer needed
DROP FUNCTION IF EXISTS update_appointments_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_reviews_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_services_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_clinics_updated_at() CASCADE;

-- =============================================================================
-- Step 4: Verification
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Legacy clinic system REMOVED successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Removed tables:';
  RAISE NOTICE '  - clinics';
  RAISE NOTICE '  - services';
  RAISE NOTICE '  - reviews';
  RAISE NOTICE '  - appointments';
  RAISE NOTICE '';
  RAISE NOTICE 'Removed types:';
  RAISE NOTICE '  - appointment_status';
  RAISE NOTICE '';
  RAISE NOTICE 'Removed functions:';
  RAISE NOTICE '  - update_clinics_updated_at()';
  RAISE NOTICE '  - update_services_updated_at()';
  RAISE NOTICE '  - update_reviews_updated_at()';
  RAISE NOTICE '  - update_appointments_updated_at()';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Active System (RETAINED):';
  RAISE NOTICE '  ✅ companies';
  RAISE NOTICE '  ✅ company_services';
  RAISE NOTICE '  ✅ service_categories';
  RAISE NOTICE '  ✅ category_specializations';
  RAISE NOTICE '========================================';
END $$;

-- =============================================================================
-- Migration Complete
-- =============================================================================
-- Next Steps:
-- 1. Remove backend/src/models/clinic.model.ts
-- 2. Remove backend/src/routes/clinic.routes.ts
-- 3. Remove backend/src/routes/review.routes.ts
-- 4. Remove backend/src/routes/appointment.routes.ts
-- 5. Remove backend/src/controllers/clinic.controller.ts (if exists)
-- 6. Update backend/src/app.ts to remove legacy route imports
-- =============================================================================
