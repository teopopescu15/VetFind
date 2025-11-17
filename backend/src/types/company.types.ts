// Company Types for VetFinder Backend
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
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyDTO {
  user_id: number;

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
