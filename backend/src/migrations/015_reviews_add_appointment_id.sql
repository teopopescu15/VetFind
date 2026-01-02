-- Migration 015: Add appointment_id to reviews and enforce one review per appointment

-- Add appointment_id column if missing
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS appointment_id INTEGER;

-- Add foreign key to appointments (set NULL on appointment delete to preserve review history)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'reviews' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'appointment_id'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT fk_reviews_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Ensure one review per appointment: unique index on appointment_id where not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relname = 'uq_reviews_appointment_id'
  ) THEN
    CREATE UNIQUE INDEX uq_reviews_appointment_id ON reviews(appointment_id) WHERE appointment_id IS NOT NULL;
  END IF;
END
$$;
