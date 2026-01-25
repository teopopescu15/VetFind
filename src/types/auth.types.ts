export type UserRole = 'user' | 'vetcompany';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  // Home address fields (pet owner)
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
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Optional home address fields (pet owner)
  street?: string;
  street_number?: string;
  building?: string;
  apartment?: string;
  city?: string;
  county?: string;
  postal_code?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  data: User;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  /** Update current user's profile fields (e.g., home address). Returns updated user. */
  updateUser: (data: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}
