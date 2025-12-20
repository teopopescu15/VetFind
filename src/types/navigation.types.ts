/**
 * Navigation types for React Navigation
 * Defines all routes and their parameters for type-safe navigation
 */

import { CompanyService } from './company.types';

export type RootStackParamList = {
  // Auth routes
  Login: undefined;
  Register: undefined;

  // Main app routes
  Dashboard: undefined;
  CreateCompany: undefined;
  CompanyCreatedSuccess: {
    companyId: number;
    companyName: string;
  };
  CompanyDashboard: undefined;
  ManageServices: undefined;
  ManagePrices: undefined;
  ManagePhotos: undefined;

  // User (Pet Owner) routes
  UserDashboard: undefined;
  VetCompanyDetail: {
    companyId: number;
  };

  // Appointment booking routes
  BookAppointment: {
    companyId: number;
    companyName?: string;
    /** Selected services (preferred) */
    selectedServices?: CompanyService[];
    /** Alternatively pass only service ids (better for web URLs) */
    selectedServiceIds?: number[];
    // Legacy single-service params (optional)
    serviceId?: number;
    serviceName?: string;
    serviceDuration?: number;
    servicePrice?: { min: number; max: number };
  };
  MyAppointments: undefined;

  // Legacy routes (kept for compatibility)
  ClinicDetail: {
    clinicId: number;
  };
};
