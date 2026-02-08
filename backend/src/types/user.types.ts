export type UserRole = 'user' | 'vetcompany';

// Home address fields for pet owners
export interface UserAddress {
  street?: string;
  street_number?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Home address fields
  street?: string;
  street_number?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  show_emergency_clinics?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Optional address fields (primarily for pet owners)
  street?: string;
  street_number?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  show_emergency_clinics?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  // Address fields
  street?: string;
  street_number?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  show_emergency_clinics?: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  // Home address fields
  street?: string;
  street_number?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  show_emergency_clinics?: boolean;
  created_at: Date;
  updated_at: Date;
}

// JWT Token payload
export interface TokenPayload {
  id: number;
  email: string;
  role: UserRole;
}