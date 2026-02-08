import type { Facility, PaymentMethod } from './company.types';

// Clinic types
export interface Clinic {
  id?: number;
  owner_id?: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: OpeningHours;
  photo_urls?: string[];
  avg_rating?: number;
  review_count?: number;
  distance?: number;
  created_at?: string;
  updated_at?: string;

  // Optional fields included when clinics are fetched in full
  facilities?: Facility[];
  payment_methods?: PaymentMethod[];
}

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

// Service types
export interface Service {
  id?: number;
  clinic_id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

// Review types
export type ReviewCategory = 'pisica' | 'caine' | 'pasare' | 'altele';

export interface Review {
  id?: number;
  clinic_id: number;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  rating: number;
  comment?: string;
  category?: ReviewCategory;
  professionalism?: number;
  efficiency?: number;
  friendliness?: number;
  appointment_service_names?: string; // service names from the reviewed appointment (comma-separated)
  created_at?: string;
  updated_at?: string;
}

// Appointment types
export interface Appointment {
  id?: number;
  clinic_id: number;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  service_id?: number;
  service_name?: string;
  service_price?: number;
  appointment_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  error?: string;
}
