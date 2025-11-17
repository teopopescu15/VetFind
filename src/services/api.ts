import {
  LoginCredentials,
  SignupData,
  AuthResponse,
  RefreshResponse,
  VerifyResponse,
  User,
  AuthTokens
} from '../types/auth.types';
import {
  Company,
  CreateCompanyDTO,
  UpdateCompanyDTO,
  CompanyService,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceTemplate,
  CompanyApiResponse,
  ServicesApiResponse,
  ServiceTemplatesApiResponse,
} from '../types/company.types';

// API Base URL Configuration
// All services run in WSL, so we use localhost for communication
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// Factory function to create API service
const createApiService = () => {
  const baseUrl = BASE_URL;

  /**
   * Make API request with proper headers
   */
  const request = async (
    endpoint: string,
    method: string = 'GET',
    body?: any,
    accessToken?: string
  ): Promise<any> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if provided
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Extract error message, handling various response formats
        let errorMessage = 'Request failed';

        // Handle direct message property
        if (typeof data.message === 'string' && data.message) {
          errorMessage = data.message;
        }
        // Handle error.message structure (from error middleware)
        else if (data.error && typeof data.error.message === 'string') {
          errorMessage = data.error.message;
        }
        // Handle direct error string
        else if (typeof data.error === 'string' && data.error) {
          errorMessage = data.error;
        }
        // Last resort: stringify the error object
        else if (data.error) {
          try {
            errorMessage = JSON.stringify(data.error);
          } catch {
            errorMessage = 'An error occurred';
          }
        }

        const error = new Error(errorMessage);
        error.name = 'ApiError';
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('API request error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || String(error) || 'Network request failed');
    }
  };

  return {
    /**
     * Generic request method for authenticated API calls
     */
    async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
      // Get access token from AsyncStorage if needed for authenticated requests
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    },

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<{ user: User; accessToken: string; refreshToken: string }> {
      try {
        const response: AuthResponse = await request('/auth/login', 'POST', credentials);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }

        return {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        };
      } catch (error: any) {
        throw new Error(error.message || 'Login failed');
      }
    },

    /**
     * Sign up new user
     */
    async signup(data: SignupData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
      try {
        const response: AuthResponse = await request('/auth/signup', 'POST', data);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Signup failed');
        }

        return {
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        };
      } catch (error: any) {
        throw new Error(error.message || 'Signup failed');
      }
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<AuthTokens> {
      try {
        const response: RefreshResponse = await request('/auth/refresh', 'POST', { refreshToken });

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Token refresh failed');
        }

        return {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        };
      } catch (error: any) {
        throw new Error(error.message || 'Token refresh failed');
      }
    },

    /**
     * Verify current access token
     */
    async verifyToken(accessToken: string): Promise<User> {
      try {
        const response: VerifyResponse = await request('/auth/verify', 'GET', undefined, accessToken);

        if (!response.success || !response.data) {
          throw new Error('Token verification failed');
        }

        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Token verification failed');
      }
    },

    // ==================== Company Methods ====================

    /**
     * Create a new company profile
     */
    async createCompany(data: CreateCompanyDTO, accessToken?: string): Promise<Company> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        const response: CompanyApiResponse = await request('/companies', 'POST', data, token || undefined);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Company creation failed');
        }

        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Company creation failed');
      }
    },

    /**
     * Get current user's company profile
     */
    async getMyCompany(accessToken?: string): Promise<Company | null> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        const response: CompanyApiResponse = await request('/companies/my-company', 'GET', undefined, token || undefined);

        if (!response.success) {
          return null;
        }

        return response.data || null;
      } catch (error: any) {
        console.error('Get my company error:', error);
        return null;
      }
    },

    /**
     * Get company by ID (public)
     */
    async getCompanyById(id: number): Promise<Company | null> {
      try {
        const response: CompanyApiResponse = await request(`/companies/${id}`, 'GET');

        if (!response.success || !response.data) {
          return null;
        }

        return response.data;
      } catch (error: any) {
        console.error('Get company error:', error);
        return null;
      }
    },

    /**
     * Update company profile
     */
    async updateCompany(id: number, data: UpdateCompanyDTO, accessToken?: string): Promise<Company> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        const response: CompanyApiResponse = await request(`/companies/${id}`, 'PUT', data, token || undefined);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Company update failed');
        }

        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Company update failed');
      }
    },

    /**
     * Delete company profile
     */
    async deleteCompany(id: number, accessToken?: string): Promise<boolean> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        await request(`/companies/${id}`, 'DELETE', undefined, token || undefined);
        return true;
      } catch (error: any) {
        console.error('Delete company error:', error);
        return false;
      }
    },

    /**
     * Upload company photo
     */
    async uploadCompanyPhoto(companyId: number, photoUri: string, accessToken?: string): Promise<string> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

        // For React Native, we'll need to use FormData
        const formData = new FormData();

        // Handle base64 or file URI
        if (photoUri.startsWith('data:')) {
          // Base64 image
          const blob = await fetch(photoUri).then(r => r.blob());
          formData.append('photo', blob, 'photo.jpg');
        } else {
          // File URI (React Native)
          const filename = photoUri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('photo', {
            uri: photoUri,
            name: filename,
            type,
          } as any);
        }

        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${baseUrl}/companies/${companyId}/photos`, {
          method: 'POST',
          headers,
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Photo upload failed');
        }

        return data.data.photo_url;
      } catch (error: any) {
        throw new Error(error.message || 'Photo upload failed');
      }
    },

    /**
     * Delete company photo
     */
    async deleteCompanyPhoto(companyId: number, photoUrl: string, accessToken?: string): Promise<boolean> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

        // Extract photo ID or filename from URL
        const photoId = photoUrl.split('/').pop() || '';

        await request(`/companies/${companyId}/photos/${photoId}`, 'DELETE', undefined, token || undefined);
        return true;
      } catch (error: any) {
        console.error('Delete photo error:', error);
        return false;
      }
    },

    /**
     * Search companies with filters (public)
     */
    async searchCompanies(filters?: {
      city?: string;
      state?: string;
      clinic_type?: string;
      specialization?: string;
      latitude?: number;
      longitude?: number;
      radius_km?: number;
      is_verified?: boolean;
    }): Promise<Company[]> {
      try {
        const queryParams = new URLSearchParams();

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, String(value));
            }
          });
        }

        const endpoint = `/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await request(endpoint, 'GET');

        if (!response.success || !response.data) {
          return [];
        }

        return response.data;
      } catch (error: any) {
        console.error('Search companies error:', error);
        return [];
      }
    },

    // ==================== Company Service Methods ====================

    /**
     * Create a new service for a company
     */
    async createService(companyId: number, data: CreateServiceDTO, accessToken?: string): Promise<CompanyService> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        const response = await request(`/companies/${companyId}/services`, 'POST', data, token || undefined);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Service creation failed');
        }

        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Service creation failed');
      }
    },

    /**
     * Get all services for a company (public)
     */
    async getServices(companyId: number): Promise<CompanyService[]> {
      try {
        const response: ServicesApiResponse = await request(`/companies/${companyId}/services`, 'GET');

        if (!response.success || !response.data) {
          return [];
        }

        return response.data;
      } catch (error: any) {
        console.error('Get services error:', error);
        return [];
      }
    },

    /**
     * Update a service
     */
    async updateService(
      companyId: number,
      serviceId: number,
      data: UpdateServiceDTO,
      accessToken?: string
    ): Promise<CompanyService> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        const response = await request(`/companies/${companyId}/services/${serviceId}`, 'PUT', data, token || undefined);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Service update failed');
        }

        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Service update failed');
      }
    },

    /**
     * Delete a service
     */
    async deleteService(companyId: number, serviceId: number, accessToken?: string): Promise<boolean> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        await request(`/companies/${companyId}/services/${serviceId}`, 'DELETE', undefined, token || undefined);
        return true;
      } catch (error: any) {
        console.error('Delete service error:', error);
        return false;
      }
    },

    /**
     * Bulk create services for a company
     */
    async bulkCreateServices(
      companyId: number,
      services: CreateServiceDTO[],
      accessToken?: string
    ): Promise<CompanyService[]> {
      try {
        const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
        const response: ServicesApiResponse = await request(
          `/companies/${companyId}/services/bulk`,
          'POST',
          { services },
          token || undefined
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Bulk service creation failed');
        }

        return response.data;
      } catch (error: any) {
        throw new Error(error.message || 'Bulk service creation failed');
      }
    },

    /**
     * Get service templates (public)
     */
    async getServiceTemplates(): Promise<ServiceTemplate[]> {
      try {
        const response: ServiceTemplatesApiResponse = await request('/services/templates', 'GET');

        if (!response.success || !response.data) {
          return [];
        }

        return response.data;
      } catch (error: any) {
        console.error('Get service templates error:', error);
        return [];
      }
    }
  };
};

// Export singleton instance
export const ApiService = createApiService();

// Export as apiService for compatibility
export const apiService = ApiService;
