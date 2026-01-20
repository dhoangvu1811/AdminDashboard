import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

import { authService } from '@/services/authService'
import type { AuthState, LoginPayload, User } from '@/types/auth.types'

// =========================================
// Initial State
// =========================================
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true, // True initially to check auth status on app load
  error: null
}

// =========================================
// Async Thunks
// =========================================

/**
 * Login async thunk
 */
export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    const response = await authService.login(payload)

    return response.data.user
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    const message = err.response?.data?.message || 'Đăng nhập thất bại'

    return rejectWithValue(message)
  }
})

/**
 * Logout async thunk
 */
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout()

    return true
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    const message = err.response?.data?.message || 'Đăng xuất thất bại'

    return rejectWithValue(message)
  }
})

/**
 * Check auth status on app load
 * Tries to get current user info using existing cookies
 */
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser()

    return response.data
  } catch {
    // Silent fail - user is not authenticated
    return rejectWithValue(null)
  }
})

// =========================================
// Slice
// =========================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user manually (e.g., from SSR or cached data)
    setUser: (state, action: { payload: User | null }) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },

    // Clear auth state
    clearAuth: state => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
    },

    // Clear error
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(login.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        // BE đã kiểm tra loginContext kết hợp với role (admin/staff)
        // Nếu API thành công = user có quyền truy cập Admin Dashboard
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.isCheckingAuth = false
        state.error = null
        toast.success('Đăng nhập thành công!')
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string

        // Toast is handled by axios interceptor
      })

    // Logout
    builder
      .addCase(logout.pending, state => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
        toast.success('Đăng xuất thành công!')
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Check Auth
    builder
      .addCase(checkAuth.pending, state => {
        state.isCheckingAuth = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(checkAuth.rejected, state => {
        state.isCheckingAuth = false
        state.user = null
        state.isAuthenticated = false
      })
  }
})

// =========================================
// Exports
// =========================================
export const { setUser, clearAuth, clearError } = authSlice.actions
export default authSlice.reducer
