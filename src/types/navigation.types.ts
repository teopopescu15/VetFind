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
  VetFinderHome: undefined;
  ClinicDetail: {
    clinicId: number;
  };
  BookAppointment: {
    clinicId: number;
    clinicName: string;
  };
  MyAppointments: undefined;
};
