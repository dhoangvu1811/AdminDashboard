import { axiosInstance, API_ENDPOINTS } from '@/libs/api'
import type { LoginPayload, LoginResponse, LogoutResponse, CurrentUserResponse } from '@/types/auth.types'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login with email and password
   * Backend will set HttpOnly cookies for tokens
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload)

    return response.data
  },

  /**
   * Logout current user
   * Backend will clear HttpOnly cookies
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await axiosInstance.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT)

    return response.data
  },

  /**
   * Refresh access token using refresh token from cookie
   * Called automatically by axios interceptor on 401
   */
  refreshToken: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
  },

  /**
   * Get current authenticated user info
   * Can be used to verify if user is still logged in
   */
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await axiosInstance.get<CurrentUserResponse>(API_ENDPOINTS.USERS.ME)

    return response.data
  }
}

export default authService
