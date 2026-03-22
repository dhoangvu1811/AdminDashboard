// =========================================
// Authentication Types
// =========================================

// Role Type (dynamic)
export type UserRoleName = string

// Role Entity (as returned from API)
export interface Role {
  id: number
  name: string
  displayName: string
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
  code: number
  message: string
  data: {
    user: User
  }
}

export interface CurrentUserResponse {
  code: number
  message: string
  data: User
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
  code: number
  message: string
  data: null
}
