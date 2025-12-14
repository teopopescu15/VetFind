/**
 * Navigation types for React Navigation
 * Defines all routes and their parameters for type-safe navigation
 */

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

  // User (Pet Owner) routes
  UserDashboard: undefined;
  VetCompanyDetail: {
    companyId: number;
  };

  // Appointment booking routes
  BookAppointment: {
    companyId: number;
    serviceId: number;
    companyName: string;
    serviceName: string;
    serviceDuration: number;
    servicePrice: { min: number; max: number };
  };
  MyAppointments: undefined;

  // Legacy routes (kept for compatibility)
  ClinicDetail: {
    clinicId: number;
  };
};
