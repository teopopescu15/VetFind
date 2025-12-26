// Appointment Types for VetFinder Backend
// Follows object-literal pattern (no classes)

import { Company } from './company.types';
import { CompanyService } from './companyService.types';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: number;
  clinic_id: number;
  user_id: number;
  service_id?: number;
  appointment_date: Date;
  status: AppointmentStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;

  // Joined data (when fetching with relations)
  company?: Company;
  service?: CompanyService;
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
  // Optional array of selected services (ids or objects) when booking multiple services
  services?: Array<number | { id: number }>;
  appointment_date: string | Date; // ISO datetime string or Date object
  status?: AppointmentStatus; // Default: 'confirmed' for instant booking
  notes?: string;
}

export interface UpdateAppointmentDTO {
  appointment_date?: string | Date;
  status?: AppointmentStatus;
  notes?: string;
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format)
  datetime: string; // ISO datetime for the slot
  available: boolean;
}

export interface AvailabilityRequest {
  companyId: number;
  serviceId: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional, defaults to startDate + 30 days)
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
