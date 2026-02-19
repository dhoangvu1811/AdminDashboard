import type { PaginationInfo, SearchParams } from './api.types'

// =========================================
// Voucher Enums
// =========================================

export enum VoucherType {
  PERCENT = 'percent',
  FIXED = 'fixed'
}

// =========================================
// Voucher Entity
// =========================================

export interface Voucher {
  id: number
  code: string
  type: VoucherType
  amount: number
  maxDiscount: number | null
  minOrderValue: number | null
  startDate: string | null
  endDate: string | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

// =========================================
// API Payload Types
// =========================================

export interface CreateVoucherPayload {
  code: string
  type: VoucherType | string
  amount: number
  maxDiscount?: number | null
  minOrderValue?: number | null
  startDate?: string | null
  endDate?: string | null
  usageLimit?: number | null
  isActive?: boolean
  description?: string | null
}

export interface UpdateVoucherPayload {
  code?: string
  type?: VoucherType | string
  amount?: number
  maxDiscount?: number | null
  minOrderValue?: number | null
  startDate?: string | null
  endDate?: string | null
  usageLimit?: number | null
  isActive?: boolean
  description?: string | null
}

export interface DeleteMultipleVouchersPayload {
  voucherIds: string[]
}

// =========================================
// Filter Types
// =========================================

export interface VoucherFilters extends SearchParams {
  search?: string
  type?: VoucherType | string
  isActive?: string
  sort?: string
}

// =========================================
// API Response Types
// =========================================

export interface VoucherListResponse {
  code: number
  message: string
  data: {
    vouchers: Voucher[]
    pagination: PaginationInfo
  }
}

export interface VoucherDetailResponse {
  code: number
  message: string
  data: Voucher
}

// =========================================
// Redux State Type
// =========================================

export interface VoucherState {
  vouchers: Voucher[]
  selectedVoucher: Voucher | null
  pagination: PaginationInfo
  filters: VoucherFilters
  isLoading: boolean
  error: string | null
}
