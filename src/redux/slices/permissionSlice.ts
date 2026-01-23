import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import permissionService from '@/services/permissionService'
import type { Permission, PermissionState, CreatePermissionPayload, UpdatePermissionPayload } from '@/types/role.types'

const initialState: PermissionState = {
  permissions: [],
  selectedPermission: null,
  myPermissions: [],
  isLoading: false,
  error: null
}

export const fetchPermissions = createAsyncThunk('permissions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await permissionService.getAll()
    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách quyền hạn')
  }
})

export const fetchMyPermissions = createAsyncThunk('permissions/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const response = await permissionService.getMyPermissions()
    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải quyền hạn của bạn')
  }
})

export const createPermission = createAsyncThunk(
  'permissions/create',
  async (payload: CreatePermissionPayload, { rejectWithValue }) => {
    try {
      const response = await permissionService.create(payload)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo quyền hạn')
    }
  }
)

export const updatePermission = createAsyncThunk(
  'permissions/update',
  async ({ id, payload }: { id: number | string; payload: UpdatePermissionPayload }, { rejectWithValue }) => {
    try {
      const response = await permissionService.update(id, payload)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật quyền hạn')
    }
  }
)

export const deletePermission = createAsyncThunk(
  'permissions/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await permissionService.delete(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa quyền hạn')
    }
  }
)

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissionErrors: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPermissions.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as any
        state.permissions = Array.isArray(payload) ? payload : payload.data || []
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder.addCase(createPermission.fulfilled, (state, action) => {
      const payload = action.payload as any
      const newPermission = payload.data || payload
      state.permissions.push(newPermission)
    })

    builder.addCase(updatePermission.fulfilled, (state, action) => {
      const payload = action.payload as any
      const updatedPermission = payload.data || payload
      const index = state.permissions.findIndex(p => p.id === updatedPermission.id)
      if (index !== -1) {
        state.permissions[index] = updatedPermission
      }
    })

    builder.addCase(deletePermission.fulfilled, (state, action) => {
      state.permissions = state.permissions.filter(p => p.id !== Number(action.payload))
    })

    builder.addCase(fetchMyPermissions.fulfilled, (state, action) => {
      const payload = action.payload as any
      state.myPermissions = Array.isArray(payload) ? payload : payload.data || []
    })
  }
})

export const { clearPermissionErrors } = permissionSlice.actions
export default permissionSlice.reducer
