-- Migration: Add category_id column to company_services table
-- Description: The frontend and backend send category_id but the column was never created in migration 006

-- Add category_id column to company_services table
ALTER TABLE company_services
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_company_services_category_id ON company_services(category_id);

-- Add comment for documentation
COMMENT ON COLUMN company_services.category_id IS 'Reference to service_categories for organizing services by category';
