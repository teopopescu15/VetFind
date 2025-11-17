// Company Service Types for VetFinder Backend
// Follows object-literal pattern (no classes)

export type ServiceCategory =
  | 'routine_care'
  | 'dental_care'
  | 'diagnostic_services'
  | 'emergency_care'
  | 'surgical_procedures'
  | 'grooming'
  | 'custom';

export interface CompanyService {
  id: number;
  company_id: number;

  // Service Information
  category: ServiceCategory;
  service_name: string;
  description?: string;

  // Pricing
  price_min: number;
  price_max: number;

  // Duration (in minutes)
  duration_minutes?: number;

  // Flags
  is_custom: boolean;
  is_active: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface CreateServiceDTO {
  company_id: number;
  category: ServiceCategory;
  service_name: string;
  description?: string;
  price_min: number;
  price_max: number;
  duration_minutes?: number;
  is_custom?: boolean;
}

export interface UpdateServiceDTO {
  category?: ServiceCategory;
  service_name?: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface BulkCreateServiceDTO {
  services: CreateServiceDTO[];
}

// Pre-defined service templates for each category
export interface ServiceTemplate {
  category: ServiceCategory;
  service_name: string;
  suggested_price_min: number;
  suggested_price_max: number;
  duration_minutes?: number;
  description: string;
}

// Service templates to help clinics quickly set up common services
export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  // Routine Care
  {
    category: 'routine_care',
    service_name: 'General Checkup',
    suggested_price_min: 50,
    suggested_price_max: 80,
    duration_minutes: 30,
    description: 'Complete physical examination',
  },
  {
    category: 'routine_care',
    service_name: 'Vaccination (per shot)',
    suggested_price_min: 25,
    suggested_price_max: 45,
    duration_minutes: 15,
    description: 'Individual vaccine administration',
  },
  {
    category: 'routine_care',
    service_name: 'Flea/Tick Prevention',
    suggested_price_min: 30,
    suggested_price_max: 60,
    duration_minutes: 10,
    description: 'Monthly prevention treatment',
  },
  {
    category: 'routine_care',
    service_name: 'Deworming',
    suggested_price_min: 20,
    suggested_price_max: 40,
    duration_minutes: 10,
    description: 'Parasite treatment',
  },
  {
    category: 'routine_care',
    service_name: 'Nail Trimming',
    suggested_price_min: 15,
    suggested_price_max: 25,
    duration_minutes: 15,
    description: 'Nail care service',
  },
  {
    category: 'routine_care',
    service_name: 'Microchipping',
    suggested_price_min: 45,
    suggested_price_max: 75,
    duration_minutes: 20,
    description: 'Permanent identification',
  },

  // Dental Care
  {
    category: 'dental_care',
    service_name: 'Dental Checkup',
    suggested_price_min: 60,
    suggested_price_max: 100,
    duration_minutes: 30,
    description: 'Oral health examination',
  },
  {
    category: 'dental_care',
    service_name: 'Teeth Cleaning',
    suggested_price_min: 200,
    suggested_price_max: 400,
    duration_minutes: 90,
    description: 'Professional dental cleaning',
  },
  {
    category: 'dental_care',
    service_name: 'Tooth Extraction',
    suggested_price_min: 300,
    suggested_price_max: 800,
    duration_minutes: 120,
    description: 'Surgical tooth removal',
  },

  // Diagnostic Services
  {
    category: 'diagnostic_services',
    service_name: 'Blood Test (Basic)',
    suggested_price_min: 80,
    suggested_price_max: 150,
    duration_minutes: 30,
    description: 'Complete blood count and chemistry',
  },
  {
    category: 'diagnostic_services',
    service_name: 'X-Ray',
    suggested_price_min: 150,
    suggested_price_max: 300,
    duration_minutes: 45,
    description: 'Radiographic imaging',
  },
  {
    category: 'diagnostic_services',
    service_name: 'Ultrasound',
    suggested_price_min: 250,
    suggested_price_max: 500,
    duration_minutes: 60,
    description: 'Ultrasound imaging',
  },
  {
    category: 'diagnostic_services',
    service_name: 'Urinalysis',
    suggested_price_min: 50,
    suggested_price_max: 100,
    duration_minutes: 20,
    description: 'Urine analysis',
  },

  // Emergency Care
  {
    category: 'emergency_care',
    service_name: 'Emergency Consultation',
    suggested_price_min: 150,
    suggested_price_max: 300,
    duration_minutes: 30,
    description: 'Immediate emergency assessment',
  },
  {
    category: 'emergency_care',
    service_name: 'Emergency Surgery',
    suggested_price_min: 1000,
    suggested_price_max: 5000,
    duration_minutes: 180,
    description: 'Urgent surgical intervention',
  },
  {
    category: 'emergency_care',
    service_name: 'Overnight Hospitalization',
    suggested_price_min: 200,
    suggested_price_max: 500,
    duration_minutes: 1440, // 24 hours
    description: 'Inpatient care and monitoring',
  },

  // Surgical Procedures
  {
    category: 'surgical_procedures',
    service_name: 'Spay/Neuter (Cat)',
    suggested_price_min: 150,
    suggested_price_max: 300,
    duration_minutes: 90,
    description: 'Feline sterilization surgery',
  },
  {
    category: 'surgical_procedures',
    service_name: 'Spay/Neuter (Dog)',
    suggested_price_min: 200,
    suggested_price_max: 500,
    duration_minutes: 120,
    description: 'Canine sterilization surgery',
  },
  {
    category: 'surgical_procedures',
    service_name: 'Soft Tissue Surgery',
    suggested_price_min: 500,
    suggested_price_max: 2000,
    duration_minutes: 120,
    description: 'Non-orthopedic surgical procedures',
  },
  {
    category: 'surgical_procedures',
    service_name: 'Orthopedic Surgery',
    suggested_price_min: 2000,
    suggested_price_max: 5000,
    duration_minutes: 180,
    description: 'Bone and joint surgery',
  },

  // Grooming
  {
    category: 'grooming',
    service_name: 'Bath & Brush',
    suggested_price_min: 40,
    suggested_price_max: 80,
    duration_minutes: 60,
    description: 'Basic bathing and brushing service',
  },
  {
    category: 'grooming',
    service_name: 'Full Grooming',
    suggested_price_min: 60,
    suggested_price_max: 150,
    duration_minutes: 120,
    description: 'Complete grooming package',
  },
  {
    category: 'grooming',
    service_name: 'Ear Cleaning',
    suggested_price_min: 20,
    suggested_price_max: 35,
    duration_minutes: 15,
    description: 'Ear cleaning and inspection',
  },
];
