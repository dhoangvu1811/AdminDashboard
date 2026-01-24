'use client'

import { useEffect, createContext, useContext, type ReactNode } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { checkAuth } from '@/redux/slices/authSlice'
import { fetchMyPermissions } from '@/redux/slices/permissionSlice'

interface AuthContextType {
  isCheckingAuth: boolean
}

const AuthContext = createContext<AuthContextType>({ isCheckingAuth: true })

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider - Handles authentication check on app load
 * This ensures checkAuth is only called once at the app level,
 * not in every component that uses useAuth hook
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isCheckingAuth } = useAppSelector(state => state.auth)

  // Check auth status only once on app mount
  useEffect(() => {
    if (!isAuthenticated && isCheckingAuth) {
      dispatch(checkAuth())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  // Fetch permissions when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyPermissions())
    }
  }, [dispatch, isAuthenticated])

  return <AuthContext.Provider value={{ isCheckingAuth }}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth checking status from context
 */
export function useAuthContext() {
  return useContext(AuthContext)
}

export default AuthProvider
