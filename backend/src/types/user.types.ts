export type UserRole = 'user' | 'vetcompany';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// JWT Token payload
export interface TokenPayload {
  id: number;
  email: string;
  role: UserRole;
}