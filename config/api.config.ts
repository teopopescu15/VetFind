// API Configuration for Mobile/Web Access
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // For development - all services run in WSL, use localhost
  if (__DEV__) {
    return 'http://localhost:5000/api';
  }

  // For production (update with your production URL)
  return 'https://your-production-api.com/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function for API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default API_CONFIG;