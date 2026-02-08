// API Response Types
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationInfo
}

export interface PaginationInfo {
  page: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Query Params
export interface PaginationParams {
  page?: number
  limit?: number
  itemsPerPage?: number
}

export interface SearchParams extends PaginationParams {
  search?: string
}
