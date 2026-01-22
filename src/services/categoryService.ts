import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  DeleteMultipleCategoriesPayload,
  CategoryListResponse,
  CategoryDetailResponse
} from '@/types/category.types'

const categoryService = {
  getAll: async (params?: { search?: string }) => {
    const response = await axiosInstance.get<Category[]>(API_ENDPOINTS.CATEGORIES.ALL, {
      params
    })
    // Based on API docs, it returns array directly.
    return response.data
  },

  getById: async (id: number | string) => {
    const response = await axiosInstance.get<Category>(API_ENDPOINTS.CATEGORIES.DETAILS(id))
    return response.data
  },

  create: async (payload: CreateCategoryPayload) => {
    const formData = new FormData()
    formData.append('name', payload.name)
    if (payload.description) {
      formData.append('description', payload.description)
    }
    if (payload.image) {
      formData.append('image', payload.image)
    }

    const response = await axiosInstance.post<Category>(API_ENDPOINTS.CATEGORIES.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  update: async (id: number | string, payload: UpdateCategoryPayload) => {
    const formData = new FormData()
    if (payload.name) formData.append('name', payload.name)
    if (payload.description !== undefined) {
      // Handle null/empty description if needed, or just append string
      formData.append('description', payload.description || '')
    }
    if (payload.image) {
      formData.append('image', payload.image)
    } else if (payload.image === null) {
      // Send 'null' string to indicate deletion/clearing of image
      formData.append('image', 'null')
    }

    const response = await axiosInstance.put<Category>(API_ENDPOINTS.CATEGORIES.UPDATE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  delete: async (id: number | string) => {
    const response = await axiosInstance.delete<{ message: string }>(API_ENDPOINTS.CATEGORIES.DELETE(id))
    return response.data
  },

  deleteMultiple: async (payload: DeleteMultipleCategoriesPayload) => {
    const response = await axiosInstance.delete<{ message: string }>(API_ENDPOINTS.CATEGORIES.DELETE_MANY, {
      data: payload
    })
    return response.data
  }
}

export default categoryService
