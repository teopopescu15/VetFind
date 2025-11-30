/**
 * Types for Google Routes API integration
 * Used for driving distance calculations
 */

/**
 * Single route distance result
 */
export interface RouteDistance {
  companyId: string;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  condition: 'ROUTE_EXISTS' | 'ROUTE_NOT_FOUND';
}

/**
 * Response from /api/routes/distances endpoint
 */
export interface RouteDistancesResponse {
  success: boolean;
  data: {
    distances: RouteDistance[];
    totalCompanies: number;
    companiesWithCoordinates: number;
    companiesWithRoutes: number;
  };
  error?: string;
}

/**
 * Response from /api/routes/status endpoint
 */
export interface RouteStatusResponse {
  success: boolean;
  data: {
    configured: boolean;
    message: string;
  };
}

/**
 * Request body for /api/routes/distances endpoint
 */
export interface RouteDistancesRequest {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  companyIds: string[];
}
