-- Add pet owner preference: show clinics available in emergency mode when closed
-- Configurable at signup and in User Settings

ALTER TABLE users
ADD COLUMN IF NOT EXISTS show_emergency_clinics BOOLEAN DEFAULT false;

COMMENT ON COLUMN users.show_emergency_clinics IS 'When true, dashboard "Disponibil acum" shows closed clinics that offer emergency care (with fee and contact)';
