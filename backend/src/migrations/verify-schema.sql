-- =============================================================================
-- Verificare: codul backend ACTUAL vs. baza de date (VetFind)
-- Rulează în pgAdmin pe baza VetFind (Query Tool → Run). Rezultat în Messages.
--
-- IMPORTANT: Verifică DOAR schema CURENTĂ folosită de cod (companies, company_id,
-- users cu adresă, appointments/reviews noi). NU verifică și NU folosește
-- variantele vechi (clinics, clinic_id, tabela services legacy).
-- =============================================================================

DO $$ BEGIN RAISE NOTICE '========== VERIFICARE SCHEMĂ (doar schema curentă, fără legacy) =========='; END $$;

-- Helper: check column exists
DO $$
DECLARE
  missing TEXT[] := ARRAY[]::TEXT[];
  r RECORD;
BEGIN
  -- 1) users – câmpuri adresă folosite de cod (migrarea 019; NU există în schema veche)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'street') THEN
    missing := array_append(missing, 'users.street');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'county') THEN
    missing := array_append(missing, 'users.county');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'users' AND column_name = 'latitude') THEN
    missing := array_append(missing, 'users.latitude');
  END IF;

  -- 2) companies – schema curentă (008 company_completed, 016 rating/review_count)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'companies' AND column_name = 'company_completed') THEN
    missing := array_append(missing, 'companies.company_completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'companies' AND column_name = 'rating') THEN
    missing := array_append(missing, 'companies.rating');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'companies' AND column_name = 'review_count') THEN
    missing := array_append(missing, 'companies.review_count');
  END IF;

  -- 3) company_services – schema curentă (010 category_id, 006 specialization_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'company_services' AND column_name = 'category_id') THEN
    missing := array_append(missing, 'company_services.category_id');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'company_services' AND column_name = 'specialization_id') THEN
    missing := array_append(missing, 'company_services.specialization_id');
  END IF;

  -- 4) appointments – schema curentă (012 total_*, 013 deleted, 017 expired)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'appointments' AND column_name = 'total_duration_minutes') THEN
    missing := array_append(missing, 'appointments.total_duration_minutes');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'appointments' AND column_name = 'deleted') THEN
    missing := array_append(missing, 'appointments.deleted');
  END IF;

  -- 5) reviews – schema curentă (015 appointment_id; reviews cu company_id, nu clinic_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'reviews' AND column_name = 'appointment_id') THEN
    missing := array_append(missing, 'reviews.appointment_id');
  END IF;

  -- Raport
  IF array_length(missing, 1) IS NULL OR array_length(missing, 1) = 0 THEN
    RAISE NOTICE 'Rezultat: OK – Toate coloanele necesare codului există în bază.';
  ELSE
    RAISE WARNING 'Rezultat: LIPSESC coloane (codul le folosește, dar nu sunt în DB): %', array_to_string(missing, ', ');
    RAISE WARNING 'Acțiune: rulează din nou migrările (npm run db:migrate) sau aplică manual migrările care adaugă aceste coloane.';
  END IF;
END $$;

-- Tabele obligatorii (doar cele folosite de cod acum; fără clinics, services legacy)
DO $$
DECLARE
  required_tables TEXT[] := ARRAY['users','refresh_tokens','companies','company_services','service_categories','category_specializations','appointments','appointment_services','reviews'];
  t TEXT;
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOREACH t IN ARRAY required_tables
  LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = t) THEN
      missing_tables := array_append(missing_tables, t);
    END IF;
  END LOOP;
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Tabele lipsă: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'Toate tabelele obligatorii (schema curentă) există.';
  END IF;
END $$;

-- Enum folosit de cod: appointment_status cu 'expired' (migrarea 017)
DO $$
DECLARE
  enum_vals TEXT[];
BEGIN
  SELECT array_agg(enumlabel::TEXT ORDER BY enumsortorder) INTO enum_vals
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'appointment_status';
  IF enum_vals IS NULL THEN
    RAISE WARNING 'Tipul appointment_status nu există.';
  ELSIF NOT ('expired' = ANY(enum_vals)) THEN
    RAISE WARNING 'appointment_status nu conține valoarea "expired" (migrarea 017).';
  ELSE
    RAISE NOTICE 'Enum appointment_status include "expired".';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '========== Sfârșit verificare =========='; END $$;
