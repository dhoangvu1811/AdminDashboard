import type { User, UserRoleName } from './auth.types'
import type { PaginationInfo, SearchParams } from './api.types'

// =========================================
// User Management Types
// =========================================

// Re-export User from auth.types for convenience
export type { User, UserRoleName }

// User Filters
export interface UserFilters extends SearchParams {
  status?: 'active' | 'inactive'
  role?: UserRoleName
}

// User List Response
// User List Response
export interface UserListResponse {
  success: boolean
  message: string
  data: {
    users: User[]
    pagination: PaginationInfo
  }
}

// User Detail Response
export interface UserDetailResponse {
  success: boolean
  message: string
  data: User
}

// Create User Payload
export interface CreateUserPayload {
  name: string
  email: string
  password: string
  confirmPassword?: string
  phoneNumber?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  roleId: number
  emailVerified?: boolean
}

// Update User Payload
export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  phoneNumber?: string
  address?: string
  avatar?: string
  status?: 'active' | 'inactive'
}

// Delete Multiple Users Payload
export interface DeleteMultipleUsersPayload {
  userIds: string[]
}

// Change Role Payload
export interface ChangeRolePayload {
  roleId: number
}

// User Overview Response
export interface UserOverviewResponse {
  success: boolean
  message: string
  data: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalSessions: number
    newUsersToday: number
    newUsersThisMonth: number
  }
}

// Session Types
export interface Session {
  sessionId: string
  deviceInfo: string
  ipAddress: string
  createdAt: string
  expiresAt: string
  logoutAt: string | null
  isActive: boolean
  isExpired: boolean
  status: string
}

export interface SessionListResponse {
  code: number
  message: string
  data: {
    userId: string
    sessions: Session[]
    summary?: {
      active: number
      revoked: number
      expired: number
      logout: number
    }
    total?: number
  }
}

export interface RevokeSessionPayload {
  sessionId: string
}

// User State for Redux
export interface UserState {
  users: User[]
  selectedUser: User | null
  overview: UserOverviewResponse['data'] | null
  sessions: Session[]
  pagination: PaginationInfo
  filters: UserFilters
  isLoading: boolean
  isLoadingDetail: boolean
  isLoadingOverview: boolean
  isLoadingSessions: boolean
  error: string | null
}
