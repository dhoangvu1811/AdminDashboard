// =========================================
// Authentication Types
// =========================================

// User Role
export type UserRole = 'user' | 'admin'

// User Entity
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
  avatar?: string | null
  phone?: string | null
  address?: string | null
  createdAt: string
  updatedAt: string
}

// Login Request Payload
export interface LoginPayload {
  email: string
  password: string
}

// Login Response from API
export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
  }
}

// Auth State for Redux
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isCheckingAuth: boolean
  error: string | null
}

// Logout Response
export interface LogoutResponse {
  success: boolean
  message: string
}
