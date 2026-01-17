// Appointment Types for VetFinder Frontend
// Follows object-literal pattern (no classes)

import { Company } from './company.types';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'expired';

export interface Appointment {
  id: number;
  clinic_id: number;
  user_id: number;
  service_id?: number;
  appointment_date: string; // ISO datetime string
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined data (when fetching with relations)
  company?: Company;
  service?: {
    id: number;
    service_name: string;
    price_min: number;
    price_max: number;
    duration_minutes?: number;
  };
  user_name?: string;
  user_email?: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  service_name?: string;
  service_price?: number;
}

export interface CreateAppointmentDTO {
  clinic_id: number;
  user_id: number;
  service_id?: number;
  services?: number[]; // optional array of selected service ids for multi-service bookings
  appointment_date: string; // ISO datetime string
  status?: AppointmentStatus; // Default: 'confirmed' for instant booking
  // Note: server now creates appointments with 'pending' status by default; company must accept to confirm
  notes?: string;
}

export interface UpdateAppointmentDTO {
  appointment_date?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format)
  datetime: string; // ISO datetime for the slot
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // monday, tuesday, etc.
  isOpen: boolean;
  openingHours?: {
    open: string; // HH:MM
    close: string; // HH:MM
  };
  slots: TimeSlot[];
}

export interface AvailabilityResponse {
  success: boolean;
  companyId: number;
  serviceId: number;
  serviceDuration: number;
  startDate: string;
  endDate: string;
  data: DayAvailability[];
}

export interface CreateAppointmentResponse {
  success: boolean;
  message: string;
  data: Appointment;
}

export interface UserAppointmentsResponse {
  success: boolean;
  count: number;
  data: Appointment[];
}

export interface CancelAppointmentResponse {
  success: boolean;
  message: string;
}
