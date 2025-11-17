import { apiService } from './api';
import type { Clinic, Service, Review, Appointment, ApiResponse } from '../types/vet.types';

// Factory function for VetFinder API service
export const createVetApiService = () => {
  return {
    // Clinic endpoints
    clinics: {
      async getAll(limit: number = 50, offset: number = 0): Promise<Clinic[]> {
        const response = await apiService.request<ApiResponse<Clinic[]>>(
          `/vet/clinics?limit=${limit}&offset=${offset}`
        );
        return response.data || [];
      },

      async getById(id: number): Promise<Clinic | null> {
        const response = await apiService.request<ApiResponse<Clinic>>(`/vet/clinics/${id}`);
        return response.data || null;
      },

      async getByCity(city: string): Promise<Clinic[]> {
        const response = await apiService.request<ApiResponse<Clinic[]>>(
          `/vet/clinics/city/${encodeURIComponent(city)}`
        );
        return response.data || [];
      },

      async getNearby(latitude: number, longitude: number, radius: number = 10): Promise<Clinic[]> {
        const response = await apiService.request<ApiResponse<Clinic[]>>(
          `/vet/clinics/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
        );
        return response.data || [];
      },

      async getMyClinics(): Promise<Clinic[]> {
        const response = await apiService.request<ApiResponse<Clinic[]>>('/vet/my-clinics');
        return response.data || [];
      },

      async create(clinic: Clinic): Promise<Clinic> {
        const response = await apiService.request<ApiResponse<Clinic>>('/vet/clinics', {
          method: 'POST',
          body: JSON.stringify(clinic)
        });
        if (!response.data) {
          throw new Error(response.message || 'Failed to create clinic');
        }
        return response.data;
      },

      async update(id: number, clinic: Partial<Clinic>): Promise<Clinic> {
        const response = await apiService.request<ApiResponse<Clinic>>(`/vet/clinics/${id}`, {
          method: 'PUT',
          body: JSON.stringify(clinic)
        });
        if (!response.data) {
          throw new Error(response.message || 'Failed to update clinic');
        }
        return response.data;
      },

      async delete(id: number): Promise<void> {
        await apiService.request<ApiResponse<void>>(`/vet/clinics/${id}`, {
          method: 'DELETE'
        });
      }
    },

    // Service endpoints
    services: {
      async getByClinic(clinicId: number): Promise<Service[]> {
        const response = await apiService.request<ApiResponse<Service[]>>(
          `/vet/clinics/${clinicId}/services`
        );
        return response.data || [];
      },

      async create(clinicId: number, service: Service): Promise<Service> {
        const response = await apiService.request<ApiResponse<Service>>(
          `/vet/clinics/${clinicId}/services`,
          {
            method: 'POST',
            body: JSON.stringify(service)
          }
        );
        if (!response.data) {
          throw new Error(response.message || 'Failed to create service');
        }
        return response.data;
      },

      async update(serviceId: number, service: Partial<Service>): Promise<Service> {
        const response = await apiService.request<ApiResponse<Service>>(
          `/vet/services/${serviceId}`,
          {
            method: 'PUT',
            body: JSON.stringify(service)
          }
        );
        if (!response.data) {
          throw new Error(response.message || 'Failed to update service');
        }
        return response.data;
      },

      async delete(serviceId: number): Promise<void> {
        await apiService.request<ApiResponse<void>>(`/vet/services/${serviceId}`, {
          method: 'DELETE'
        });
      }
    },

    // Review endpoints
    reviews: {
      async getByClinic(clinicId: number): Promise<Review[]> {
        const response = await apiService.request<ApiResponse<Review[]>>(
          `/vet/clinics/${clinicId}/reviews`
        );
        return response.data || [];
      },

      async getMyReviews(): Promise<Review[]> {
        const response = await apiService.request<ApiResponse<Review[]>>('/vet/my-reviews');
        return response.data || [];
      },

      async create(clinicId: number, review: Omit<Review, 'id' | 'clinic_id'>): Promise<Review> {
        const response = await apiService.request<ApiResponse<Review>>(
          `/vet/clinics/${clinicId}/reviews`,
          {
            method: 'POST',
            body: JSON.stringify(review)
          }
        );
        if (!response.data) {
          throw new Error(response.message || 'Failed to create review');
        }
        return response.data;
      },

      async update(reviewId: number, review: Partial<Review>): Promise<Review> {
        const response = await apiService.request<ApiResponse<Review>>(`/vet/reviews/${reviewId}`, {
          method: 'PUT',
          body: JSON.stringify(review)
        });
        if (!response.data) {
          throw new Error(response.message || 'Failed to update review');
        }
        return response.data;
      },

      async delete(reviewId: number): Promise<void> {
        await apiService.request<ApiResponse<void>>(`/vet/reviews/${reviewId}`, {
          method: 'DELETE'
        });
      }
    },

    // Appointment endpoints
    appointments: {
      async getById(id: number): Promise<Appointment | null> {
        const response = await apiService.request<ApiResponse<Appointment>>(
          `/vet/appointments/${id}`
        );
        return response.data || null;
      },

      async getMyAppointments(status?: string): Promise<Appointment[]> {
        const url = status
          ? `/vet/my-appointments?status=${status}`
          : '/vet/my-appointments';
        const response = await apiService.request<ApiResponse<Appointment[]>>(url);
        return response.data || [];
      },

      async getUpcoming(): Promise<Appointment[]> {
        const response = await apiService.request<ApiResponse<Appointment[]>>(
          '/vet/my-appointments/upcoming'
        );
        return response.data || [];
      },

      async getPast(): Promise<Appointment[]> {
        const response = await apiService.request<ApiResponse<Appointment[]>>(
          '/vet/my-appointments/past'
        );
        return response.data || [];
      },

      async getClinicAppointments(clinicId: number, status?: string): Promise<Appointment[]> {
        const url = status
          ? `/vet/clinics/${clinicId}/appointments?status=${status}`
          : `/vet/clinics/${clinicId}/appointments`;
        const response = await apiService.request<ApiResponse<Appointment[]>>(url);
        return response.data || [];
      },

      async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
        const response = await apiService.request<ApiResponse<Appointment>>('/vet/appointments', {
          method: 'POST',
          body: JSON.stringify(appointment)
        });
        if (!response.data) {
          throw new Error(response.message || 'Failed to create appointment');
        }
        return response.data;
      },

      async update(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
        const response = await apiService.request<ApiResponse<Appointment>>(
          `/vet/appointments/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(appointment)
          }
        );
        if (!response.data) {
          throw new Error(response.message || 'Failed to update appointment');
        }
        return response.data;
      },

      async cancel(id: number): Promise<Appointment> {
        const response = await apiService.request<ApiResponse<Appointment>>(
          `/vet/appointments/${id}/cancel`,
          {
            method: 'POST'
          }
        );
        if (!response.data) {
          throw new Error(response.message || 'Failed to cancel appointment');
        }
        return response.data;
      },

      async delete(id: number): Promise<void> {
        await apiService.request<ApiResponse<void>>(`/vet/appointments/${id}`, {
          method: 'DELETE'
        });
      }
    }
  };
};

// Export singleton instance
export const vetApi = createVetApiService();
