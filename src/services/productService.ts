import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type {
  ProductListResponse,
  ProductDetailResponse,
  CreateProductPayload,
  UpdateProductPayload,
  DeleteMultipleProductsPayload,
  ProductFilters,
  UploadImageResponse
} from '@/types/product.types'
import type { CategoryListResponse } from '@/types/category.types'

export const productService = {
  /**
   * Get all products with pagination and filters
   */
  getAll: async (params?: ProductFilters) => {
    const response = await axiosInstance.get<ProductListResponse>(API_ENDPOINTS.PRODUCTS.ALL, {
      params
    })

    return response.data
  },

  /**
   * Get all product categories
   */
  getAllCategories: async () => {
    const response = await axiosInstance.get<CategoryListResponse>(API_ENDPOINTS.CATEGORIES.ALL)

    return response.data
  },

  /**
   * Get product details by ID
   */
  getById: async (id: number | string) => {
    const response = await axiosInstance.get<ProductDetailResponse>(API_ENDPOINTS.PRODUCTS.DETAILS(id))

    return response.data
  },

  /**
   * Create a new product
   */
  create: async (payload: CreateProductPayload) => {
    const response = await axiosInstance.post<ProductDetailResponse>(API_ENDPOINTS.PRODUCTS.CREATE, payload)

    return response.data
  },

  /**
   * Update a product
   */
  update: async (id: number | string, payload: UpdateProductPayload) => {
    const response = await axiosInstance.put<ProductDetailResponse>(API_ENDPOINTS.PRODUCTS.UPDATE(id), payload)

    return response.data
  },

  /**
   * Delete a product
   */
  delete: async (id: number | string) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id))

    return response.data
  },

  /**
   * Delete multiple products
   */
  deleteMultiple: async (payload: DeleteMultipleProductsPayload) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.DELETE_MULTIPLE, payload)

    return response.data
  },

  /**
   * Upload product image
   */
  uploadImage: async (file: File) => {
    const formData = new FormData()

    formData.append('image', file)

    const response = await axiosInstance.post<UploadImageResponse>(API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  }
}
