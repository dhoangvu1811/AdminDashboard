import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type {
  VoucherListResponse,
  VoucherDetailResponse,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  DeleteMultipleVouchersPayload,
  VoucherFilters
} from '@/types/voucher.types'
import type { ApiResponse } from '@/types/api.types'

export const voucherService = {
  /**
   * Lấy tất cả vouchers với phân trang và bộ lọc
   */
  getAll: async (params?: VoucherFilters) => {
    const response = await axiosInstance.get<VoucherListResponse>(API_ENDPOINTS.VOUCHERS.ALL, {
      params
    })

    return response.data
  },

  /**
   * Lấy chi tiết voucher theo ID
   */
  getById: async (id: number | string) => {
    const response = await axiosInstance.get<VoucherDetailResponse>(API_ENDPOINTS.VOUCHERS.DETAILS(id))

    return response.data
  },

  /**
   * Tạo voucher mới
   */
  create: async (payload: CreateVoucherPayload) => {
    const response = await axiosInstance.post<VoucherDetailResponse>(API_ENDPOINTS.VOUCHERS.CREATE, payload)

    return response.data
  },

  /**
   * Cập nhật voucher
   */
  update: async (id: number | string, payload: UpdateVoucherPayload) => {
    const response = await axiosInstance.put<VoucherDetailResponse>(API_ENDPOINTS.VOUCHERS.UPDATE(id), payload)

    return response.data
  },

  /**
   * Xóa một voucher
   */
  delete: async (id: number | string) => {
    const response = await axiosInstance.delete<ApiResponse>(API_ENDPOINTS.VOUCHERS.DELETE(id))

    return response.data
  },

  /**
   * Xóa nhiều vouchers
   */
  deleteMultiple: async (payload: DeleteMultipleVouchersPayload) => {
    const response = await axiosInstance.post<ApiResponse>(API_ENDPOINTS.VOUCHERS.DELETE_MULTIPLE, payload)

    return response.data
  }
}
