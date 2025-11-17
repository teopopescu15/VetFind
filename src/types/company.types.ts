// Company Types for VetFinder Frontend
// Mirrors backend types for consistent type safety across the stack
// Follows object-literal pattern (no classes)

export type ClinicType =
  | 'general_practice'
  | 'emergency_care'
  | 'specialized_care'
  | 'mobile_vet'
  | 'emergency_24_7';

export type Specialization =
  | 'dogs'
  | 'cats'
  | 'exotic_pets'
  | 'large_animals'
  | 'emergency_surgery'
  | 'dental_care'
  | 'grooming'
  | 'boarding'
  | 'lab_services'
  | 'radiology'
  | 'ultrasound'
  | 'microchipping'
  | 'pharmacy';

export type Facility =
  | 'emergency_24_7'
  | 'in_house_lab'
  | 'surgery_room'
  | 'isolation_ward'
  | 'grooming_station'
  | 'pharmacy'
  | 'parking'
  | 'wheelchair_accessible'
  | 'pickup_dropoff';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'mobile_payment'
  | 'pet_insurance';

export type ServiceCategory =
  | 'routine_care'
  | 'dental_care'
  | 'diagnostic_services'
  | 'emergency_care'
  | 'surgical_procedures'
  | 'grooming'
  | 'custom';

export interface DaySchedule {
  open: string; // "09:00"
  close: string; // "17:00"
  closed: boolean;
}

export interface OpeningHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface Company {
  id: number;
  user_id: number;

  // Basic Information
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;

  // Location Information
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;

  // Business Details
  clinic_type: ClinicType;
  years_in_business?: number;
  num_veterinarians?: number;

  // Media
  logo_url?: string;
  photos: string[]; // Array of photo URLs

  // Arrays
  specializations: Specialization[];
  facilities: Facility[];
  payment_methods: PaymentMethod[];

  // Opening Hours
  opening_hours: OpeningHours;

  // Status
  is_verified: boolean;
  is_active: boolean;

  // Timestamps
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateCompanyDTO {
  user_id?: number; // Optional - will be set from auth token on backend

  // Basic Information (Required)
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;

  // Location Information (Required)
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;

  // Business Details
  clinic_type: ClinicType;
  years_in_business?: number;
  num_veterinarians?: number;

  // Media
  logo_url?: string;
  photos?: string[];

  // Arrays
  specializations?: Specialization[];
  facilities?: Facility[];
  payment_methods?: PaymentMethod[];

  // Opening Hours
  opening_hours?: OpeningHours;
}

export interface UpdateCompanyDTO {
  // Basic Information
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;

  // Location Information
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;

  // Business Details
  clinic_type?: ClinicType;
  years_in_business?: number;
  num_veterinarians?: number;

  // Media
  logo_url?: string;
  photos?: string[];

  // Arrays
  specializations?: Specialization[];
  facilities?: Facility[];
  payment_methods?: PaymentMethod[];

  // Opening Hours
  opening_hours?: OpeningHours;

  // Status
  is_active?: boolean;
}

export interface CompanySearchFilters {
  city?: string;
  state?: string;
  clinic_type?: ClinicType;
  specialization?: Specialization;
  latitude?: number;
  longitude?: number;
  radius_km?: number; // For location-based search
  is_verified?: boolean;
}

// Company Service Types
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
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateServiceDTO {
  company_id?: number; // Optional - will be set from company context
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

export interface ServiceTemplate {
  category: ServiceCategory;
  service_name: string;
  suggested_price_min: number;
  suggested_price_max: number;
  duration_minutes?: number;
  description: string;
}

// Multi-step form data types
export interface Step1FormData {
  name: string;
  logo_url?: string;
  email: string;
  phone: string;
  description?: string;
}

export interface Step2FormData {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  opening_hours?: OpeningHours;
}

export interface Step3FormData {
  clinic_type: ClinicType;
  specializations: Specialization[];
  facilities: Facility[];
  num_veterinarians?: number;
  years_in_business?: number;
  payment_methods: PaymentMethod[];
}

export interface Step4FormData {
  services: CreateServiceDTO[];
  photos: string[];
  full_description?: string;
}

export interface CompanyFormData {
  step1: Partial<Step1FormData>;
  step2: Partial<Step2FormData>;
  step3: Partial<Step3FormData>;
  step4: Partial<Step4FormData>;
}

export interface FormErrors {
  step1?: { [key: string]: string };
  step2?: { [key: string]: string };
  step3?: { [key: string]: string };
  step4?: { [key: string]: string };
}

// API Response types
export interface CompanyApiResponse {
  success: boolean;
  data?: Company;
  message?: string;
}

export interface CompaniesApiResponse {
  success: boolean;
  data?: Company[];
  message?: string;
}

export interface ServiceApiResponse {
  success: boolean;
  data?: CompanyService;
  message?: string;
}

export interface ServicesApiResponse {
  success: boolean;
  data?: CompanyService[];
  message?: string;
}

export interface ServiceTemplatesApiResponse {
  success: boolean;
  data?: ServiceTemplate[];
  message?: string;
}

// Utility types for form state management
export type FormStep = 1 | 2 | 3 | 4;

export interface FormState {
  currentStep: FormStep;
  formData: CompanyFormData;
  errors: FormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Helper type guards
export const isValidClinicType = (value: string): value is ClinicType => {
  return ['general_practice', 'emergency_care', 'specialized_care', 'mobile_vet', 'emergency_24_7'].includes(value);
};

export const isValidServiceCategory = (value: string): value is ServiceCategory => {
  return ['routine_care', 'dental_care', 'diagnostic_services', 'emergency_care', 'surgical_procedures', 'grooming', 'custom'].includes(value);
};

// Label mappings for UI display
export const ClinicTypeLabels: Record<ClinicType, string> = {
  general_practice: 'General Practice',
  emergency_care: 'Emergency Care',
  specialized_care: 'Specialized Care',
  mobile_vet: 'Mobile Vet',
  emergency_24_7: '24/7 Emergency',
};

export const SpecializationLabels: Record<Specialization, string> = {
  dogs: 'Dogs',
  cats: 'Cats',
  exotic_pets: 'Exotic Pets',
  large_animals: 'Large Animals',
  emergency_surgery: 'Emergency Surgery',
  dental_care: 'Dental Care',
  grooming: 'Grooming',
  boarding: 'Boarding',
  lab_services: 'Lab Services',
  radiology: 'Radiology',
  ultrasound: 'Ultrasound',
  microchipping: 'Microchipping',
  pharmacy: 'Pharmacy',
};

export const FacilityLabels: Record<Facility, string> = {
  emergency_24_7: '24/7 Emergency',
  in_house_lab: 'In-House Lab',
  surgery_room: 'Surgery Room',
  isolation_ward: 'Isolation Ward',
  grooming_station: 'Grooming Station',
  pharmacy: 'Pharmacy',
  parking: 'Parking',
  wheelchair_accessible: 'Wheelchair Accessible',
  pickup_dropoff: 'Pickup/Dropoff Service',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  mobile_payment: 'Mobile Payment',
  pet_insurance: 'Pet Insurance',
};

export const ServiceCategoryLabels: Record<ServiceCategory, string> = {
  routine_care: 'Routine Care',
  dental_care: 'Dental Care',
  diagnostic_services: 'Diagnostic Services',
  emergency_care: 'Emergency Care',
  surgical_procedures: 'Surgical Procedures',
  grooming: 'Grooming',
  custom: 'Custom Service',
};
