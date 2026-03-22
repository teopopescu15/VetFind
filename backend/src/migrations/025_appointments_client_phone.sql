-- Snapshot telefon client la programare (clinica îl vede chiar dacă users.phone lipsește din JOIN)
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS client_phone VARCHAR(30);

COMMENT ON COLUMN appointments.client_phone IS 'Telefonul proprietarului la momentul rezervării; completat din users.phone';

UPDATE appointments a
SET client_phone = NULLIF(TRIM(u.phone), '')
FROM users u
WHERE a.user_id = u.id
  AND u.id > 0
  AND NULLIF(TRIM(u.phone), '') IS NOT NULL
  AND (a.client_phone IS NULL OR TRIM(a.client_phone) = '');
