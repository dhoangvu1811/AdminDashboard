import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type {
  CreatePermissionPayload,
  UpdatePermissionPayload,
  PermissionListResponse,
  PermissionDetailResponse,
  PermissionFilters
} from '@/types/role.types'

const permissionService = {
  getAll: async (params?: PermissionFilters) => {
    const response = await axiosInstance.get<PermissionListResponse>(API_ENDPOINTS.PERMISSIONS.ALL, {
      params
    })

    return response.data
  },

  getMyPermissions: async () => {
    const response = await axiosInstance.get<PermissionListResponse>(API_ENDPOINTS.PERMISSIONS.ME)

    return response.data
  },

  getById: async (id: number | string) => {
    const response = await axiosInstance.get<PermissionDetailResponse>(API_ENDPOINTS.PERMISSIONS.DETAILS(id))

    return response.data
  },

  create: async (payload: CreatePermissionPayload) => {
    const response = await axiosInstance.post<PermissionDetailResponse>(API_ENDPOINTS.PERMISSIONS.CREATE, payload)

    return response.data
  },

  update: async (id: number | string, payload: UpdatePermissionPayload) => {
    const response = await axiosInstance.put<PermissionDetailResponse>(API_ENDPOINTS.PERMISSIONS.UPDATE(id), payload)

    return response.data
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.PERMISSIONS.DELETE(id))

    return response.data
  }
}

export default permissionService
