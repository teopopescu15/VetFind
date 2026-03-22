-- Pet owner phone (visible to clinic on appointments)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

COMMENT ON COLUMN users.phone IS 'Romanian format; optional; shown to clinic with appointment';
