import type { PaginationInfo, SearchParams } from './api.types'

// =========================================
// Category Entity Types
// =========================================

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
  createdAt: string
  updatedAt: string
}

// =========================================
// API Payload Types
// =========================================

export interface CreateCategoryPayload {
  name: string
  description?: string
  image?: File | string
}

export interface UpdateCategoryPayload {
  name?: string
  description?: string
  image?: File | string | null
}

export interface DeleteMultipleCategoriesPayload {
  ids: number[]
}

export interface CategoryFilters extends SearchParams {
  search?: string
}

// =========================================
// API Response Types
// =========================================

export interface CategoryListResponse {
  code?: number
  message?: string
  data?: Category[]
}

export interface CategoryDetailResponse {
  code: number
  message: string
  data: Category
}

// =========================================
// Redux State Type
// =========================================

export interface CategoryState {
  categories: Category[]
  selectedCategory: Category | null
  filters: CategoryFilters
  isLoading: boolean
  error: string | null
}
