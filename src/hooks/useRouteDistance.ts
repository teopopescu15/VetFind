/**
 * useRouteDistance Hook
 * Manages fetching and caching driving distances from Google Routes API
 * Provides actual road distances and travel times for vet company cards
 */

import { useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { RouteDistance } from '../types/routes.types';

export interface UseRouteDistanceResult {
  /** Map of company ID to route distance data */
  distances: Map<string, RouteDistance>;
  /** Whether route distances are currently being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether the Google Routes API is configured on backend */
  isApiConfigured: boolean | null;
  /** Fetch route distances for given companies */
  fetchDistances: (
    userLocation: { latitude: number; longitude: number },
    companyIds: string[],
    accessToken: string
  ) => Promise<void>;
  /** Get cached distance for a specific company */
  getDistance: (companyId: string) => RouteDistance | undefined;
  /** Clear all cached distances */
  clearCache: () => void;
  /** Check if API is configured */
  checkApiStatus: () => Promise<boolean>;
}

/**
 * Hook for managing driving distance calculations
 * Includes caching to prevent unnecessary API calls
 *
 * @example
 * ```tsx
 * const { fetchDistances, getDistance, isLoading } = useRouteDistance();
 *
 * // Fetch distances when location filter is active
 * useEffect(() => {
 *   if (location && companies.length > 0) {
 *     fetchDistances(location, companies.map(c => c.id), accessToken);
 *   }
 * }, [location, companies]);
 *
 * // Get distance for a specific company
 * const routeDistance = getDistance(company.id);
 * // routeDistance?.distanceKm = 3.8
 * // routeDistance?.durationText = "12 min"
 * ```
 */
export const useRouteDistance = (): UseRouteDistanceResult => {
  const [distances, setDistances] = useState<Map<string, RouteDistance>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null);

  // Use ref for cache to avoid re-renders when cache is updated
  const cacheRef = useRef<Map<string, RouteDistance>>(new Map());

  // Track which company IDs are currently being fetched to prevent duplicate requests
  const pendingRequestsRef = useRef<Set<string>>(new Set());

  /**
   * Check if Google Routes API is configured on the backend
   */
  const checkApiStatus = useCallback(async (): Promise<boolean> => {
    try {
      const status = await apiService.getRoutesApiStatus();
      setIsApiConfigured(status.configured);
      return status.configured;
    } catch (err) {
      console.error('Error checking Routes API status:', err);
      setIsApiConfigured(false);
      return false;
    }
  }, []);

  /**
   * Fetch route distances for given companies
   * Only fetches distances for company IDs not already in cache
   */
  const fetchDistances = useCallback(
    async (
      userLocation: { latitude: number; longitude: number },
      companyIds: string[],
      accessToken: string
    ): Promise<void> => {
      if (!userLocation || companyIds.length === 0) {
        return;
      }

      // Filter out already cached IDs and currently pending requests
      const uncachedIds = companyIds.filter(
        (id) => !cacheRef.current.has(id) && !pendingRequestsRef.current.has(id)
      );

      if (uncachedIds.length === 0) {
        // All distances already cached
        return;
      }

      // Mark IDs as pending
      uncachedIds.forEach((id) => pendingRequestsRef.current.add(id));

      setIsLoading(true);
      setError(null);

      try {
        const results = await apiService.getRouteDistances(
          userLocation,
          uncachedIds,
          accessToken
        );

        // Update cache with new results
        results.forEach((result) => {
          cacheRef.current.set(result.companyId, result);
        });

        // Update state to trigger re-render
        setDistances(new Map(cacheRef.current));
      } catch (err: any) {
        console.error('Error fetching route distances:', err);
        setError(err.message || 'Failed to fetch driving distances');
      } finally {
        // Remove IDs from pending
        uncachedIds.forEach((id) => pendingRequestsRef.current.delete(id));
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get cached distance for a specific company
   */
  const getDistance = useCallback((companyId: string): RouteDistance | undefined => {
    return cacheRef.current.get(companyId);
  }, []);

  /**
   * Clear all cached distances
   * Call this when user location changes significantly or on pull-to-refresh
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    pendingRequestsRef.current.clear();
    setDistances(new Map());
    setError(null);
  }, []);

  return {
    distances,
    isLoading,
    error,
    isApiConfigured,
    fetchDistances,
    getDistance,
    clearCache,
    checkApiStatus,
  };
};

export default useRouteDistance;
