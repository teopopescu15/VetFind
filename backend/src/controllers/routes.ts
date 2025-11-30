/**
 * Routes Controller
 * Handles driving distance calculations using Google Routes API
 */

import { Request, Response } from 'express';
import { googleRoutesService } from '../services/googleRoutes';
import { pool } from '../config/database';

interface CalculateDistancesBody {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  companyIds: string[];
}

interface CompanyCoordinates {
  id: string;
  latitude: number;
  longitude: number;
}

/**
 * Factory function to create routes controller
 * Follows project's object-based pattern
 */
export const createRoutesController = () => {
  /**
   * Validate coordinates are within valid ranges
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
   * Fetch company coordinates from database by IDs
   */
  const getCompanyCoordinates = async (
    companyIds: string[]
  ): Promise<CompanyCoordinates[]> => {
    if (companyIds.length === 0) {
      return [];
    }

    // Create parameterized query with placeholders
    const placeholders = companyIds.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      SELECT id, latitude, longitude
      FROM companies
      WHERE id IN (${placeholders})
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND is_active = true
    `;

    try {
      const result = await pool.query(query, companyIds);
      return result.rows.map((row) => ({
        id: row.id,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
      }));
    } catch (error) {
      console.error('Error fetching company coordinates:', error);
      throw error;
    }
  };

  return {
    /**
     * POST /api/routes/distances
     * Calculate driving distances from user location to multiple companies
     *
     * Request body:
     * {
     *   userLocation: { latitude: number, longitude: number },
     *   companyIds: string[]
     * }
     *
     * Response:
     * {
     *   success: true,
     *   data: {
     *     distances: RouteResult[]
     *   }
     * }
     */
    async calculateDistances(req: Request, res: Response): Promise<void> {
      try {
        const { userLocation, companyIds } = req.body as CalculateDistancesBody;

        // Validate request body
        if (!userLocation) {
          res.status(400).json({
            success: false,
            error: 'userLocation is required',
          });
          return;
        }

        if (
          !isValidCoordinate(userLocation.latitude, userLocation.longitude)
        ) {
          res.status(400).json({
            success: false,
            error: 'Invalid userLocation coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.',
          });
          return;
        }

        if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
          res.status(400).json({
            success: false,
            error: 'companyIds must be a non-empty array',
          });
          return;
        }

        // Limit to prevent abuse (max 100 companies per request)
        if (companyIds.length > 100) {
          res.status(400).json({
            success: false,
            error: 'Maximum 100 companies per request',
          });
          return;
        }

        // Check if Google Routes API is configured
        if (!googleRoutesService.isConfigured()) {
          res.status(503).json({
            success: false,
            error: 'Google Routes API is not configured',
          });
          return;
        }

        // Fetch company coordinates from database
        const companyCoordinates = await getCompanyCoordinates(companyIds);

        if (companyCoordinates.length === 0) {
          res.status(200).json({
            success: true,
            data: {
              distances: [],
              message: 'No companies with valid coordinates found',
            },
          });
          return;
        }

        // Calculate driving distances using Google Routes API
        const destinations = companyCoordinates.map((company) => ({
          id: company.id,
          latitude: company.latitude,
          longitude: company.longitude,
        }));

        const distances = await googleRoutesService.calculateRouteMatrix(
          userLocation,
          destinations
        );

        res.status(200).json({
          success: true,
          data: {
            distances,
            totalCompanies: companyIds.length,
            companiesWithCoordinates: companyCoordinates.length,
            companiesWithRoutes: distances.length,
          },
        });
      } catch (error: any) {
        console.error('Error calculating distances:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to calculate distances',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },

    /**
     * GET /api/routes/status
     * Check if Google Routes API is configured and available
     */
    async getStatus(_req: Request, res: Response): Promise<void> {
      const isConfigured = googleRoutesService.isConfigured();

      res.status(200).json({
        success: true,
        data: {
          configured: isConfigured,
          message: isConfigured
            ? 'Google Routes API is configured and ready'
            : 'Google Routes API key not found. Set GOOGLE_MAPS_API_KEY in environment.',
        },
      });
    },
  };
};

// Export singleton instance
export const routesController = createRoutesController();
