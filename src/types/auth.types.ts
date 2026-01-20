// =========================================
// Authentication Types
// =========================================

// Role Type (for "user" | "admin" | "staff" values)
export type UserRoleName = 'user' | 'admin' | 'staff'

// Role Entity (as returned from API)
export interface Role {
  id: number
  name: UserRoleName
  createdAt: string
}

// User Status
export type UserStatus = 'active' | 'inactive'

// Account Type
export type TypeAccount = 'LOCAL' | 'GOOGLE'

// User Entity (aligned with API response)
export interface User {
  id: number
  name: string
  email: string
  emailVerified: boolean
  role: Role
  roleId: number
  status: UserStatus
  typeAccount: TypeAccount
  avatar?: string | null
  phoneNumber?: string | null
  address?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  googleId?: string | null
  activationToken?: string | null
  lastLogin?: string | null
  createdAt: string
  updatedAt: string
}

// Login Context Type
export type LoginContext = 'admin' | 'user'

// Login Request Payload
export interface LoginPayload {
  email: string
  password: string
  loginContext: LoginContext
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
