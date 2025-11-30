/**
 * useLocation Hook
 * Custom hook for handling device location with permission management
 * Uses Expo Location for cross-platform GPS access
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface UseLocationResult {
  location: LocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

/**
 * Factory function to create location state
 */
const createInitialState = () => ({
  location: null as LocationCoordinates | null,
  isLoading: false,
  error: null as string | null,
  permissionStatus: 'undetermined' as 'undetermined' | 'granted' | 'denied',
});

/**
 * Hook for managing device location
 * @param autoRequest - Whether to automatically request permission on mount (default: false)
 * @returns Location state and control functions
 */
export const useLocation = (autoRequest: boolean = false): UseLocationResult => {
  const [state, setState] = useState(createInitialState);

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const permissionStatus = status === 'granted' ? 'granted' :
                               status === 'denied' ? 'denied' : 'undetermined';

      setState(prev => ({ ...prev, permissionStatus }));
      return permissionStatus;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'undetermined';
    }
  }, []);

  /**
   * Request location permission from user
   * @returns true if permission granted, false otherwise
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';

      setState(prev => ({
        ...prev,
        permissionStatus: granted ? 'granted' : 'denied',
        isLoading: false,
        error: granted ? null : 'Location permission denied',
      }));

      if (granted) {
        // Automatically fetch location after permission granted
        await fetchLocation();
      }

      return granted;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to request location permission',
        permissionStatus: 'denied',
      }));
      return false;
    }
  }, []);

  /**
   * Fetch current device location
   */
  const fetchLocation = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Location permission not granted',
          permissionStatus: 'denied',
        }));
        return;
      }

      // Get current position with high accuracy
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState(prev => ({
        ...prev,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        isLoading: false,
        error: null,
        permissionStatus: 'granted',
      }));
    } catch (error: any) {
      console.error('Error fetching location:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to get location',
      }));
    }
  }, []);

  /**
   * Refresh/re-fetch location
   */
  const refreshLocation = useCallback(async () => {
    const status = await checkPermission();
    if (status === 'granted') {
      await fetchLocation();
    }
  }, [checkPermission, fetchLocation]);

  // Check permission status on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-request permission if enabled
  useEffect(() => {
    if (autoRequest && state.permissionStatus === 'undetermined') {
      requestPermission();
    }
  }, [autoRequest, state.permissionStatus, requestPermission]);

  return {
    location: state.location,
    isLoading: state.isLoading,
    error: state.error,
    permissionStatus: state.permissionStatus,
    requestPermission,
    refreshLocation,
  };
};

/**
 * Calculate distance between two coordinates in kilometers
 * Uses Haversine formula for accuracy
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

export default useLocation;
