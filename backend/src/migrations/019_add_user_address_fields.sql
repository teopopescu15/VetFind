-- Add home address fields to users table
-- These fields allow pet owners to store their home location for distance calculations

ALTER TABLE users
ADD COLUMN IF NOT EXISTS street VARCHAR(255),
ADD COLUMN IF NOT EXISTS street_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS building VARCHAR(50),
ADD COLUMN IF NOT EXISTS apartment VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS county VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Romania',
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_county ON users(county);

COMMENT ON COLUMN users.street IS 'Street name (Strada)';
COMMENT ON COLUMN users.street_number IS 'Street number (Număr)';
COMMENT ON COLUMN users.building IS 'Building/Block (Bloc) - optional';
COMMENT ON COLUMN users.apartment IS 'Apartment number (Apartament) - optional';
COMMENT ON COLUMN users.city IS 'City/Locality (Localitatea)';
COMMENT ON COLUMN users.county IS 'County code (Județul)';
COMMENT ON COLUMN users.postal_code IS 'Postal code (Cod poștal) - 6 digits for Romania';
COMMENT ON COLUMN users.country IS 'Country name';
COMMENT ON COLUMN users.latitude IS 'GPS latitude coordinate';
COMMENT ON COLUMN users.longitude IS 'GPS longitude coordinate';
