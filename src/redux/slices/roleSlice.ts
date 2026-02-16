import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import roleService from '@/services/roleService'
import type {
  Role,
  RoleState,
  CreateRolePayload,
  UpdateRolePayload,
  BulkAssignPermissionsPayload,
  RoleFilters
} from '@/types/role.types'

const initialState: RoleState = {
  roles: [],
  selectedRole: null,
  rolePermissions: [],
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
  error: null
}

export const fetchRoles = createAsyncThunk(
  'roles/fetchAll',
  async (params: RoleFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await roleService.getAll(params)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách vai trò')
    }
  }
)

export const getRoleDetails = createAsyncThunk('roles/getDetails', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await roleService.getById(id)

    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải chi tiết vai trò')
  }
})

export const createRole = createAsyncThunk('roles/create', async (payload: CreateRolePayload, { rejectWithValue }) => {
  try {
    const response = await roleService.create(payload)

    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo vai trò')
  }
})

export const updateRole = createAsyncThunk(
  'roles/update',
  async ({ id, payload }: { id: number | string; payload: UpdateRolePayload }, { rejectWithValue }) => {
    try {
      const response = await roleService.update(id, payload)

      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật vai trò')
    }
  }
)

export const deleteRole = createAsyncThunk('roles/delete', async (id: number | string, { rejectWithValue }) => {
  try {
    await roleService.delete(id)

    return id
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa vai trò')
  }
})

// Role Permissions
export const fetchRolePermissions = createAsyncThunk(
  'roles/fetchPermissions',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await roleService.getPermissions(id)

      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải quyền hạn của vai trò')
    }
  }
)

export const bulkAssignPermissions = createAsyncThunk(
  'roles/bulkAssignPermissions',
  async ({ id, payload }: { id: number | string; payload: BulkAssignPermissionsPayload }, { rejectWithValue }) => {
    try {
      await roleService.bulkAssignPermissions(id, payload)

      return payload.permissionIds
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi gán quyền hạn')
    }
  }
)

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearRoleErrors: state => {
      state.error = null
    },
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload
    }
  },
  extraReducers: builder => {
    // Fetch Roles
    builder
      .addCase(fetchRoles.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false

        // Handle wrapped response { data: { roles, pagination } }
        const payload = action.payload

        state.roles = payload.roles
        state.pagination = payload.pagination
        state.filters = action.meta.arg || {}
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Details
    builder
      .addCase(getRoleDetails.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRoleDetails.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as any

        state.selectedRole = payload.data || payload
      })
      .addCase(getRoleDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create
    builder
      .addCase(createRole.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as any
        const newRole = payload.data || payload

        state.roles.push(newRole)
        state.pagination.totalItems += 1
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update
    builder
      .addCase(updateRole.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as any
        const updatedRole = payload.data || payload

        const index = state.roles.findIndex(r => r.id === updatedRole.id)

        if (index !== -1) {
          state.roles[index] = updatedRole
        }

        if (state.selectedRole?.id === updatedRole.id) {
          state.selectedRole = updatedRole
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete
    builder
      .addCase(deleteRole.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false
        state.roles = state.roles.filter(r => r.id !== Number(action.payload))
        state.pagination.totalItems -= 1
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Role Permissions
    builder
      .addCase(fetchRolePermissions.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as any

        state.rolePermissions = Array.isArray(payload) ? payload : payload.data || []
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Bulk Assign Permissions
    builder
      .addCase(bulkAssignPermissions.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(bulkAssignPermissions.fulfilled, state => {
        state.isLoading = false

        // We might want to reload permissions here, but typically we just notify success in component
      })
      .addCase(bulkAssignPermissions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearRoleErrors, setSelectedRole } = roleSlice.actions
export default roleSlice.reducer
