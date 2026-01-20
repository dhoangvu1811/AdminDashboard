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
export interface UserListResponse {
  success: boolean
  message: string
  data: User[]
  pagination: PaginationInfo
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
  role: UserRoleName
  phone?: string
  address?: string
}

// Update User Payload
export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  role?: UserRoleName
  phone?: string
  address?: string
  avatar?: string
}

// Delete Multiple Users Payload
export interface DeleteMultipleUsersPayload {
  userIds: number[]
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
  id: string
  userId: number
  userAgent: string
  ipAddress: string
  lastActivity: string
  createdAt: string
  expiresAt: string
}

export interface SessionListResponse {
  success: boolean
  message: string
  data: Session[]
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
