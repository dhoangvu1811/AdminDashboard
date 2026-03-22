// API Response Types
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  code: number
  message: string
  data: {
    items: T[]
    pagination: PaginationInfo
  }
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
  code: number
  message: string
  data?: null
  errors?: Record<string, string[]>
  stack?: string
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
