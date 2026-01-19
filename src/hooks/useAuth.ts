'use client'

import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { login, logout, clearAuth, clearError } from '@/redux/slices/authSlice'
import type { LoginPayload } from '@/types/auth.types'

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 *
 * Note: Auth check is handled by AuthProvider at app-level
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, isLoading, isCheckingAuth, error } = useAppSelector(state => state.auth)

  // Login handler
  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const result = await dispatch(login(payload))

      return login.fulfilled.match(result)
    },
    [dispatch]
  )

  // Logout handler
  const handleLogout = useCallback(async () => {
    const result = await dispatch(logout())

    return logout.fulfilled.match(result)
  }, [dispatch])

  // Clear auth state (for manual cleanup)
  const handleClearAuth = useCallback(() => {
    dispatch(clearAuth())
  }, [dispatch])

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isCheckingAuth,
    error,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearAuth: handleClearAuth,
    clearError: handleClearError
  }
}

export default useAuth
