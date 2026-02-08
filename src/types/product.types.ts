import type { PaginationInfo, SearchParams } from './api.types'

// =========================================
// Product Entity Types
// =========================================

import type { Category } from './category.types'

export interface ProductImage {
  id: number
  productId: number
  image: string
  createdAt: string
}

export type ProductStatus = 'active' | 'inactive'

export interface Product {
  id: number
  name: string
  slug: string
  image: string // Main thumbnail
  images: ProductImage[] // Gallery
  description?: string
  price: number
  stock: number
  rating: number
  selled: number
  discount: number
  categoryId: number
  category?: Category
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

// =========================================
// API Payload Types
// =========================================

// ...
export interface CreateProductPayload {
  name: string
  image: string
  images?: string[]
  categoryId: number
  price: number
  stock: number
  description?: string
  rating?: number
  selled?: number
  discount?: number
  status?: ProductStatus
}

export interface UpdateProductPayload {
  name?: string
  image?: string
  images?: string[]
  categoryId?: number
  price?: number
  stock?: number
  description?: string
  rating?: number
  selled?: number
  discount?: number
  status?: ProductStatus
}

export interface DeleteMultipleProductsPayload {
  productIds: string[]
}

export interface ProductFilters extends SearchParams {
  categoryId?: string // Category name
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc' | 'name_desc' | 'selled_desc' | 'newest' | 'popular'
}

// =========================================
// API Response Types
// =========================================

export interface ProductListResponse {
  code: number
  message: string
  data: {
    products: Product[]
    pagination: PaginationInfo
  }
}

export interface ProductDetailResponse {
  code: number
  message: string
  data: Product
}

export interface ProductCategoryResponse {
  code: number
  message: string
  data: Category[]
}

export interface UploadImageResponse {
  code: number
  message: string
  data: {
    imageUrl: string
    publicId: string
  }
}

// =========================================
// Redux State Type
// =========================================

export interface ProductState {
  products: Product[]
  productCategories: Category[]
  selectedProduct: Product | null
  pagination: PaginationInfo
  filters: ProductFilters
  isLoading: boolean
  isLoadingDetail: boolean
  error: string | null
}
