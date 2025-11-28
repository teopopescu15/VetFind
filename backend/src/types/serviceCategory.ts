// Service Category Types

export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategorySpecialization {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  suggested_duration_minutes: number;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryWithSpecializations extends ServiceCategory {
  specializations: CategorySpecialization[];
}

// DTO for creating a new service category (admin only)
export interface CreateServiceCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

// DTO for creating a new specialization (admin only)
export interface CreateSpecializationDTO {
  category_id: number;
  name: string;
  description?: string;
  suggested_duration_minutes?: number;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

// API Response types
export interface ServiceCategoryResponse {
  success: boolean;
  data?: ServiceCategory | ServiceCategory[];
  message?: string;
}

export interface CategoryWithSpecializationsResponse {
  success: boolean;
  data?: CategoryWithSpecializations | CategoryWithSpecializations[];
  message?: string;
}

export interface SpecializationResponse {
  success: boolean;
  data?: CategorySpecialization | CategorySpecialization[];
  message?: string;
}
