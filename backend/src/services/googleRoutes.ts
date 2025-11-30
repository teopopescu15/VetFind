/**
 * Google Routes API Service
 * Calculates driving distances between user location and vet companies
 * Uses Google Routes API v2 (computeRouteMatrix)
 *
 * API Documentation: https://developers.google.com/maps/documentation/routes
 */

export interface RouteDestination {
  id: string;
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  companyId: string;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  condition: 'ROUTE_EXISTS' | 'ROUTE_NOT_FOUND';
}

interface GoogleRouteMatrixResponse {
  originIndex: number;
  destinationIndex: number;
  distanceMeters?: number;
  duration?: string;
  condition: string;
  status?: {
    code?: number;
    message?: string;
  };
}

/**
 * Format duration in seconds to human-readable text
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Parse Google's duration string (e.g., "420s") to seconds
 */
const parseDurationToSeconds = (duration: string): number => {
  // Google returns duration as "420s" format
  const match = duration.match(/^(\d+)s$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
};

/**
 * Factory function to create Google Routes Service
 * Follows project's object-based pattern (no classes)
 */
export const createGoogleRoutesService = () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const baseUrl = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

  // Maximum elements per request (Google's limit is 625)
  const MAX_ELEMENTS_PER_REQUEST = 625;

  /**
   * Check if the service is properly configured
   */
  const isConfigured = (): boolean => {
    return !!apiKey && apiKey.length > 0;
  };

  /**
   * Build the request body for Google Routes API
   */
  const buildRequestBody = (
    origin: { latitude: number; longitude: number },
    destinations: RouteDestination[]
  ) => {
    return {
      origins: [
        {
          waypoint: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude,
              },
            },
          },
        },
      ],
      destinations: destinations.map((dest) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: dest.latitude,
              longitude: dest.longitude,
            },
          },
        },
      })),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE', // Use TRAFFIC_AWARE for real-time traffic (costs more)
    };
  };

  /**
   * Make API request to Google Routes
   */
  const makeRequest = async (
    origin: { latitude: number; longitude: number },
    destinations: RouteDestination[]
  ): Promise<GoogleRouteMatrixResponse[]> => {
    const requestBody = buildRequestBody(origin, destinations);

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Routes API error:', errorText);
      throw new Error(`Google Routes API error: ${response.status} - ${errorText}`);
    }

    // The response is a JSON array (streamed as newline-delimited JSON in some cases)
    const responseText = await response.text();

    // Handle both array response and newline-delimited JSON
    try {
      // Try parsing as regular JSON array first
      return JSON.parse(responseText);
    } catch {
      // If that fails, try parsing as newline-delimited JSON
      const results: GoogleRouteMatrixResponse[] = [];
      const lines = responseText.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed && typeof parsed === 'object') {
            results.push(parsed);
          }
        } catch {
          // Skip invalid lines
        }
      }

      return results;
    }
  };

  /**
   * Calculate route matrix for given origin and destinations
   * Handles batching if destinations exceed MAX_ELEMENTS_PER_REQUEST
   */
  const calculateRouteMatrix = async (
    origin: { latitude: number; longitude: number },
    destinations: RouteDestination[]
  ): Promise<RouteResult[]> => {
    if (!isConfigured()) {
      console.warn('Google Routes API key not configured');
      return [];
    }

    if (destinations.length === 0) {
      return [];
    }

    // Validate origin coordinates
    if (
      !isValidCoordinate(origin.latitude, origin.longitude)
    ) {
      console.error('Invalid origin coordinates:', origin);
      return [];
    }

    // Filter out destinations with invalid coordinates
    const validDestinations = destinations.filter((dest) =>
      isValidCoordinate(dest.latitude, dest.longitude)
    );

    if (validDestinations.length === 0) {
      console.warn('No valid destination coordinates');
      return [];
    }

    const results: RouteResult[] = [];

    // Batch destinations if needed (shouldn't hit 625 limit for vet clinics, but good to have)
    const batches: RouteDestination[][] = [];
    for (let i = 0; i < validDestinations.length; i += MAX_ELEMENTS_PER_REQUEST) {
      batches.push(validDestinations.slice(i, i + MAX_ELEMENTS_PER_REQUEST));
    }

    for (const batch of batches) {
      try {
        const apiResults = await makeRequest(origin, batch);

        // Map API results to our format
        for (const result of apiResults) {
          const destinationIndex = result.destinationIndex;

          if (destinationIndex >= 0 && destinationIndex < batch.length) {
            const destination = batch[destinationIndex];
            const durationSeconds = result.duration
              ? parseDurationToSeconds(result.duration)
              : 0;

            results.push({
              companyId: destination.id,
              distanceMeters: result.distanceMeters || 0,
              distanceKm: result.distanceMeters
                ? Math.round((result.distanceMeters / 1000) * 10) / 10
                : 0,
              durationSeconds,
              durationText: formatDuration(durationSeconds),
              condition:
                result.condition === 'ROUTE_EXISTS'
                  ? 'ROUTE_EXISTS'
                  : 'ROUTE_NOT_FOUND',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching route matrix batch:', error);
        // Continue with other batches even if one fails
      }
    }

    return results;
  };

  /**
   * Validate if coordinates are within valid ranges
   */
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  /**
   * Calculate route for a single destination (convenience method)
   */
  const calculateSingleRoute = async (
    origin: { latitude: number; longitude: number },
    destination: RouteDestination
  ): Promise<RouteResult | null> => {
    const results = await calculateRouteMatrix(origin, [destination]);
    return results.length > 0 ? results[0] : null;
  };

  // Return the service object
  return {
    calculateRouteMatrix,
    calculateSingleRoute,
    isConfigured,
    formatDuration,
    isValidCoordinate,
  };
};

// Export singleton instance
export const googleRoutesService = createGoogleRoutesService();
