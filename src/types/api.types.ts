// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
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
  limit: number
  total: number
  totalPages: number
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
