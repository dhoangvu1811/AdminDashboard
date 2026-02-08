import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  BulkAssignPermissionsPayload,
  RoleListResponse,
  RoleFilters
} from '@/types/role.types'

const roleService = {
  // Roles
  getAll: async (params?: RoleFilters) => {
    const response = await axiosInstance.get<RoleListResponse>(API_ENDPOINTS.ROLES.ALL, {
      params
    })
    return response.data
  },

  getById: async (id: number | string) => {
    const response = await axiosInstance.get<Role>(API_ENDPOINTS.ROLES.DETAILS(id))
    return response.data
  },

  create: async (payload: CreateRolePayload) => {
    const response = await axiosInstance.post<Role>(API_ENDPOINTS.ROLES.CREATE, payload)
    return response.data
  },

  update: async (id: number | string, payload: UpdateRolePayload) => {
    const response = await axiosInstance.put<Role>(API_ENDPOINTS.ROLES.UPDATE(id), payload)
    return response.data
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.ROLES.DELETE(id))
    return response.data
  },

  // Role Permissions
  getPermissions: async (id: number | string) => {
    const response = await axiosInstance.get<Permission[]>(API_ENDPOINTS.ROLES.GET_PERMISSIONS(id))
    return response.data
  },

  assignPermission: async (id: number | string, permissionId: number) => {
    const response = await axiosInstance.post(API_ENDPOINTS.ROLES.ASSIGN_PERMISSION(id), { permissionId })
    return response.data
  },

  bulkAssignPermissions: async (id: number | string, payload: BulkAssignPermissionsPayload) => {
    const response = await axiosInstance.post(API_ENDPOINTS.ROLES.BULK_ASSIGN_PERMISSIONS(id), payload)
    return response.data
  },

  removePermission: async (id: number | string, permissionId: number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.ROLES.REMOVE_PERMISSION(id, permissionId))
    return response.data
  }
}

export default roleService
