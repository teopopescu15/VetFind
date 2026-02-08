-- Add emergency care fields to companies (urgent visits when clinic is closed)
-- emergency_contact_phone: number to call for urgent cases
-- emergency_fee: extra fee for emergency visits (taxă urgență)

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS emergency_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_fee DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30);

COMMENT ON COLUMN companies.emergency_available IS 'Clinic accepts emergency visits when closed (shown to pet owners with show_emergency_clinics)';
COMMENT ON COLUMN companies.emergency_fee IS 'Additional fee in RON for emergency visit when closed';
COMMENT ON COLUMN companies.emergency_contact_phone IS 'Phone number for emergency contact (can differ from main phone)';
