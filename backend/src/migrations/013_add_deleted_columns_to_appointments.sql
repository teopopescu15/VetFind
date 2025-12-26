-- Migration 013: Add soft-delete columns to appointments
-- Description: Add a boolean 'deleted' flag and optional 'deleted_at' timestamp to support soft-deletes.
-- Up:
ALTER TABLE IF EXISTS appointments
  ADD COLUMN IF NOT EXISTS deleted boolean DEFAULT FALSE;

ALTER TABLE IF EXISTS appointments
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Add index to speed up queries filtering deleted flag (optional)
CREATE INDEX IF NOT EXISTS idx_appointments_deleted ON appointments (deleted);

-- Down (rollback):
-- To rollback this migration, run the following commands:
-- ALTER TABLE IF EXISTS appointments DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE IF EXISTS appointments DROP COLUMN IF EXISTS deleted;
-- DROP INDEX IF EXISTS idx_appointments_deleted;
