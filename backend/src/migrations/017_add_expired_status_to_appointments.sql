-- Migration: add 'expired' value to appointment_status enum
-- Created: 2026-01-17

DO $$
BEGIN
  -- Add value only if it doesn't exist (safe on reruns)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'appointment_status'
      AND e.enumlabel = 'expired'
  ) THEN
    ALTER TYPE appointment_status ADD VALUE 'expired';
  END IF;
END$$;
