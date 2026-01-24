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
  isLoading: boolean
  error: string | null
}

export interface PermissionState {
  permissions: Permission[]
  selectedPermission: Permission | null
  myPermissions: Permission[]
  isLoading: boolean
  error: string | null
}

export interface RoleListResponse {
  code: number
  message: string
  data: Role[]
}

export interface PermissionListResponse {
  code: number
  message: string
  data: Permission[]
}
