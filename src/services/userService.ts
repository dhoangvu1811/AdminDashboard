import { axiosInstance, API_ENDPOINTS } from '@/libs/api'
import type { ApiResponse } from '@/types/api.types'
import type {
  UserListResponse,
  UserDetailResponse,
  UserOverviewResponse,
  CreateUserPayload,
  UpdateUserPayload,
  DeleteMultipleUsersPayload,
  UserFilters,
  SessionListResponse,
  RevokeSessionPayload
} from '@/types/user.types'

/**
 * User Management Service
 * Handles all user-related API calls
 */
export const userService = {
  // =========================================
  // User CRUD Operations
  // =========================================

  /**
   * Get all users with pagination and filters
   */
  getAll: async (filters: UserFilters = {}): Promise<UserListResponse> => {
    const response = await axiosInstance.get<UserListResponse>(API_ENDPOINTS.USERS.ALL, {
      params: filters
    })

    return response.data
  },

  /**
   * Get user overview statistics
   */
  getOverview: async (): Promise<UserOverviewResponse> => {
    const response = await axiosInstance.get<UserOverviewResponse>(API_ENDPOINTS.USERS.OVERVIEW)

    return response.data
  },

  /**
   * Get user details by ID
   */
  getById: async (id: number | string): Promise<UserDetailResponse> => {
    const response = await axiosInstance.get<UserDetailResponse>(API_ENDPOINTS.USERS.DETAILS(id))

    return response.data
  },

  /**
   * Create a new user
   */
  create: async (payload: CreateUserPayload): Promise<UserDetailResponse> => {
    const response = await axiosInstance.post<UserDetailResponse>(API_ENDPOINTS.USERS.CREATE, payload)

    return response.data
  },

  /**
   * Update an existing user
   */
  update: async (id: number | string, payload: UpdateUserPayload): Promise<UserDetailResponse> => {
    const response = await axiosInstance.put<UserDetailResponse>(API_ENDPOINTS.USERS.UPDATE(id), payload)

    return response.data
  },

  /**
   * Delete a user by ID
   */
  delete: async (id: number | string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(API_ENDPOINTS.USERS.DELETE(id))

    return response.data
  },

  /**
   * Delete multiple users
   */
  deleteMultiple: async (payload: DeleteMultipleUsersPayload): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>(API_ENDPOINTS.USERS.DELETE_MULTIPLE, payload)

    return response.data
  },

  // =========================================
  // User Status Management
  // =========================================

  /**
   * Activate a user account
   */
  activate: async (userId: number | string): Promise<UserDetailResponse> => {
    const response = await axiosInstance.patch<UserDetailResponse>(API_ENDPOINTS.USERS.ACTIVATE(userId))

    return response.data
  },

  /**
   * Deactivate a user account
   */
  deactivate: async (userId: number | string): Promise<UserDetailResponse> => {
    const response = await axiosInstance.patch<UserDetailResponse>(API_ENDPOINTS.USERS.DEACTIVATE(userId))

    return response.data
  },

  // =========================================
  // Session Management
  // =========================================

  /**
   * Get all sessions for a user
   */
  getSessions: async (userId: number | string): Promise<SessionListResponse> => {
    const response = await axiosInstance.get<SessionListResponse>(API_ENDPOINTS.SESSIONS.GET_USER_SESSIONS(userId))

    return response.data
  },

  /**
   * Revoke a single session
   */
  revokeSession: async (payload: RevokeSessionPayload): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>(API_ENDPOINTS.SESSIONS.REVOKE_SESSION, payload)

    return response.data
  },

  /**
   * Revoke all sessions for a user
   */
  revokeAllSessions: async (userId: number | string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(API_ENDPOINTS.SESSIONS.REVOKE_ALL_SESSIONS(userId))

    return response.data
  }
}

export default userService
