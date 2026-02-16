import type { PaginationInfo, SearchParams } from './api.types'

// =========================================
// Role Types
// =========================================

export interface Role {
  id: number
  name: string
  displayName: string

  // Assuming timestamps exist based on other entities, though not explicitly in docs for response
  // but usually present. If not, I'll remove them later.
  createdAt?: string
  updatedAt?: string
}

export interface CreateRolePayload {
  name: string
  displayName: string
}

export interface UpdateRolePayload {
  name: string
  displayName: string
}

export interface RoleFilters extends SearchParams {
  search?: string
}

// =========================================
// Permission Types
// =========================================

export interface Permission {
  id: number
  name: string
  displayName: string
  createdAt?: string
  updatedAt?: string
}

export interface PermissionDetailResponse {
  code: number
  message: string
  data: Permission
}

export interface CreatePermissionPayload {
  name: string
  displayName: string
}

export interface UpdatePermissionPayload {
  name: string
  displayName: string
}

export interface PermissionFilters extends SearchParams {
  search?: string
}

export interface AssignPermissionPayload {
  permissionId: number
}

export interface BulkAssignPermissionsPayload {
  permissionIds: number[]
}

// =========================================
// State Types
// =========================================

export interface RoleState {
  roles: Role[]
  selectedRole: Role | null
  rolePermissions: Permission[] // Permissions assigned to the selected role
  pagination: PaginationInfo
  filters: RoleFilters
  isLoading: boolean
  error: string | null
}

export interface PermissionState {
  permissions: Permission[]
  selectedPermission: Permission | null
  myPermissions: Permission[]
  pagination: PaginationInfo
  filters: PermissionFilters
  isLoading: boolean
  error: string | null
}

export interface RoleListResponse {
  code: number
  message: string
  data: {
    roles: Role[]
    pagination: PaginationInfo
  }
}

export interface PermissionListResponse {
  code: number
  message: string
  data: {
    permissions: Permission[]
    pagination: PaginationInfo
  }
}
