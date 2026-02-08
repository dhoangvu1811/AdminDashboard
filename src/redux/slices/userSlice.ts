import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

import { userService } from '@/services/userService'
import type {
  UserState,
  UserFilters,
  CreateUserPayload,
  UpdateUserPayload,
  DeleteMultipleUsersPayload,
  ChangeRolePayload,
  RevokeSessionPayload
} from '@/types/user.types'

// =========================================
// Initial State
// =========================================
const initialState: UserState = {
  users: [],
  selectedUser: null,
  overview: null,
  sessions: [],
  pagination: {
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {},
  isLoading: false,
  isLoadingDetail: false,
  isLoadingOverview: false,
  isLoadingSessions: false,
  error: null
}

// =========================================
// Async Thunks
// =========================================

/**
 * Fetch all users with filters
 */
export const fetchUsers = createAsyncThunk('users/fetchAll', async (filters: UserFilters = {}, { rejectWithValue }) => {
  try {
    const response = await userService.getAll(filters)

    const paginationData = {
      page: response.data.pagination.page,
      itemsPerPage: (response.data.pagination as any).itemsPerPage || response.data.pagination.itemsPerPage,
      totalItems: (response.data.pagination as any).totalItems || (response.data.pagination as any).totalUsers,
      totalPages: response.data.pagination.totalPages,
      hasNextPage: (response.data.pagination as any).hasNextPage,
      hasPrevPage: (response.data.pagination as any).hasPrevPage
    }

    return { users: response.data.users, pagination: paginationData, filters }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách người dùng')
  }
})

/**
 * Fetch user overview statistics
 */
export const fetchUserOverview = createAsyncThunk('users/fetchOverview', async (_, { rejectWithValue }) => {
  try {
    const response = await userService.getOverview()

    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể tải tổng quan người dùng')
  }
})

/**
 * Fetch user by ID
 */
export const fetchUserById = createAsyncThunk('users/fetchById', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await userService.getById(id)

    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin người dùng')
  }
})

/**
 * Create a new user
 */
export const createUser = createAsyncThunk('users/create', async (payload: CreateUserPayload, { rejectWithValue }) => {
  try {
    const response = await userService.create(payload)

    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể tạo người dùng')
  }
})

/**
 * Update an existing user
 */
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, payload }: { id: number | string; payload: UpdateUserPayload }, { rejectWithValue }) => {
    try {
      const response = await userService.update(id, payload)

      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật người dùng')
    }
  }
)

/**
 * Delete a user
 */
export const deleteUser = createAsyncThunk('users/delete', async (id: number | string, { rejectWithValue }) => {
  try {
    await userService.delete(id)

    return id
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể xóa người dùng')
  }
})

/**
 * Delete multiple users
 */
export const deleteMultipleUsers = createAsyncThunk(
  'users/deleteMultiple',
  async (payload: DeleteMultipleUsersPayload, { rejectWithValue }) => {
    try {
      await userService.deleteMultiple(payload)

      return payload.userIds
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể xóa nhiều người dùng')
    }
  }
)

/**
 * Activate a user
 */
export const activateUser = createAsyncThunk('users/activate', async (userId: number | string, { rejectWithValue }) => {
  try {
    const response = await userService.activate(userId)

    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể kích hoạt tài khoản')
  }
})

/**
 * Deactivate a user
 */
export const deactivateUser = createAsyncThunk(
  'users/deactivate',
  async (userId: number | string, { rejectWithValue }) => {
    try {
      const response = await userService.deactivate(userId)

      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể khóa tài khoản')
    }
  }
)

/**
 * Change user role
 */
export const changeUserRole = createAsyncThunk(
  'users/changeRole',
  async ({ userId, payload }: { userId: number | string; payload: ChangeRolePayload }, { rejectWithValue }) => {
    try {
      const response = await userService.changeRole(userId, payload)

      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể thay đổi vai trò')
    }
  }
)

/**
 * Fetch user sessions
 */
export const fetchUserSessions = createAsyncThunk(
  'users/fetchSessions',
  async (userId: number | string, { rejectWithValue }) => {
    try {
      const response = await userService.getSessions(userId)

      return response.data.sessions
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách phiên')
    }
  }
)

/**
 * Revoke a single session
 */
export const revokeSession = createAsyncThunk(
  'users/revokeSession',
  async (payload: RevokeSessionPayload, { rejectWithValue }) => {
    try {
      await userService.revokeSession(payload)

      return payload.sessionId
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể thu hồi phiên')
    }
  }
)

/**
 * Revoke all sessions for a user
 */
export const revokeAllSessions = createAsyncThunk(
  'users/revokeAllSessions',
  async (userId: number | string, { rejectWithValue }) => {
    try {
      await userService.revokeAllSessions(userId)

      return userId
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể thu hồi tất cả phiên')
    }
  }
)

// =========================================
// Slice
// =========================================
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = action.payload
    },

    // Clear selected user
    clearSelectedUser: state => {
      state.selectedUser = null
    },

    // Clear sessions
    clearSessions: state => {
      state.sessions = []
    },

    // Clear error
    clearError: state => {
      state.error = null
    },

    // Reset state
    resetUserState: () => initialState
  },
  extraReducers: builder => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.users
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Overview
    builder
      .addCase(fetchUserOverview.pending, state => {
        state.isLoadingOverview = true
      })
      .addCase(fetchUserOverview.fulfilled, (state, action) => {
        state.isLoadingOverview = false
        state.overview = action.payload
      })
      .addCase(fetchUserOverview.rejected, (state, action) => {
        state.isLoadingOverview = false
        state.error = action.payload as string
      })

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, state => {
        state.isLoadingDetail = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        state.selectedUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.error = action.payload as string
      })

    // Create User
    builder
      .addCase(createUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users.unshift(action.payload)
        state.pagination.totalItems += 1
        toast.success('Tạo người dùng thành công!')
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update User
    builder
      .addCase(updateUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false

        const index = state.users.findIndex(u => u.id === action.payload.id)

        if (index !== -1) {
          state.users[index] = action.payload
        }

        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload
        }

        toast.success('Cập nhật người dùng thành công!')
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete User
    builder
      .addCase(deleteUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = state.users.filter(u => u.id !== Number(action.payload))
        state.pagination.totalItems -= 1
        toast.success('Xóa người dùng thành công!')
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Multiple Users
    builder
      .addCase(deleteMultipleUsers.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMultipleUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = state.users.filter(u => !action.payload.includes(String(u.id)))
        state.pagination.totalItems -= action.payload.length
        toast.success(`Đã xóa ${action.payload.length} người dùng!`)
      })
      .addCase(deleteMultipleUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Activate User
    builder
      .addCase(activateUser.pending, state => {
        state.isLoading = true
      })
      .addCase(activateUser.fulfilled, (state, action) => {
        state.isLoading = false

        const index = state.users.findIndex(u => u.id === action.payload.id)

        if (index !== -1) {
          state.users[index] = action.payload
        }

        toast.success('Kích hoạt tài khoản thành công!')
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Deactivate User
    builder
      .addCase(deactivateUser.pending, state => {
        state.isLoading = true
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.isLoading = false

        const index = state.users.findIndex(u => u.id === action.payload.id)

        if (index !== -1) {
          state.users[index] = action.payload
        }

        toast.success('Khóa tài khoản thành công!')
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Change User Role
    builder
      .addCase(changeUserRole.pending, state => {
        state.isLoading = true
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.isLoading = false

        const index = state.users.findIndex(u => u.id === action.payload.id)

        if (index !== -1) {
          state.users[index] = action.payload
        }

        toast.success('Thay đổi vai trò thành công!')
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Sessions
    builder
      .addCase(fetchUserSessions.pending, state => {
        state.isLoadingSessions = true
      })
      .addCase(fetchUserSessions.fulfilled, (state, action) => {
        state.isLoadingSessions = false
        state.sessions = action.payload
      })
      .addCase(fetchUserSessions.rejected, (state, action) => {
        state.isLoadingSessions = false
        state.error = action.payload as string
      })

    // Revoke Session
    builder
      .addCase(revokeSession.pending, state => {
        state.isLoadingSessions = true
      })
      .addCase(revokeSession.fulfilled, (state, action) => {
        state.isLoadingSessions = false
        state.sessions = state.sessions.filter(s => s.sessionId !== action.payload)
        toast.success('Thu hồi phiên thành công!')
      })
      .addCase(revokeSession.rejected, (state, action) => {
        state.isLoadingSessions = false
        state.error = action.payload as string
      })

    // Revoke All Sessions
    builder
      .addCase(revokeAllSessions.pending, state => {
        state.isLoadingSessions = true
      })
      .addCase(revokeAllSessions.fulfilled, state => {
        state.isLoadingSessions = false
        state.sessions = []
        toast.success('Thu hồi tất cả phiên thành công!')
      })
      .addCase(revokeAllSessions.rejected, (state, action) => {
        state.isLoadingSessions = false
        state.error = action.payload as string
      })
  }
})

// =========================================
// Exports
// =========================================
export const { setFilters, clearSelectedUser, clearSessions, clearError, resetUserState } = userSlice.actions
export default userSlice.reducer
