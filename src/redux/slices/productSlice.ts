import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

import { productService } from '@/services/productService'
import type {
  ProductState,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
  DeleteMultipleProductsPayload
} from '@/types/product.types'

// =========================================
// Initial State
// =========================================

const initialState: ProductState = {
  products: [],
  productCategories: [],
  selectedProduct: null,
  pagination: {
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {},
  isLoading: false,
  isLoadingDetail: false,
  error: null
}

// =========================================
// Async Thunks
// =========================================

/**
 * Fetch all products with filters
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAll(filters)

      // Map API pagination to internal PaginationInfo
      // As agreed with BE, pagination structure is standardized
      const apiPagination = response.data.pagination as any

      const pagination = {
        page: apiPagination.page,
        itemsPerPage: apiPagination.itemsPerPage,
        totalItems: apiPagination.totalItems,
        totalPages: apiPagination.totalPages,
        hasNextPage: apiPagination.hasNextPage,
        hasPrevPage: apiPagination.hasPrevPage
      }

      return { products: response.data.products, pagination, filters }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      
return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách sản phẩm')
    }
  }
)

/**
 * Fetch all product categories
 */
export const fetchProductCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await productService.getAllCategories()

    
return response.data.categories
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    
return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách danh mục')
  }
})

/**
 * Fetch product by ID
 */
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await productService.getById(id)

      
return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      
return rejectWithValue(err.response?.data?.message || 'Không thể tải chi tiết sản phẩm')
    }
  }
)

/**
 * Create a new product
 */
export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    try {
      const response = await productService.create(payload)

      
return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      
return rejectWithValue(err.response?.data?.message || 'Không thể tạo sản phẩm')
    }
  }
)

/**
 * Update a product
 */
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, payload }: { id: number | string; payload: UpdateProductPayload }, { rejectWithValue }) => {
    try {
      const response = await productService.update(id, payload)

      
return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      
return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật sản phẩm')
    }
  }
)

/**
 * Delete a product
 */
export const deleteProduct = createAsyncThunk('products/delete', async (id: number | string, { rejectWithValue }) => {
  try {
    await productService.delete(id)
    
return id
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    
return rejectWithValue(err.response?.data?.message || 'Không thể xóa sản phẩm')
  }
})

/**
 * Delete multiple products
 */
export const deleteMultipleProducts = createAsyncThunk(
  'products/deleteMultiple',
  async (payload: DeleteMultipleProductsPayload, { rejectWithValue }) => {
    try {
      await productService.deleteMultiple(payload)
      
return payload.productIds
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      
return rejectWithValue(err.response?.data?.message || 'Không thể xóa nhiều sản phẩm')
    }
  }
)

// =========================================
// Slice
// =========================================

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = action.payload
    },
    clearSelectedProduct: state => {
      state.selectedProduct = null
    },
    clearError: state => {
      state.error = null
    },
    resetProductState: () => initialState
  },
  extraReducers: builder => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Categories
    builder.addCase(fetchProductCategories.fulfilled, (state, action) => {
      state.productCategories = action.payload
    })

    // Fetch Product By ID
    builder
      .addCase(fetchProductById.pending, state => {
        state.isLoadingDetail = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        state.selectedProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.error = action.payload as string
      })

    // Create Product
    builder
      .addCase(createProduct.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products.unshift(action.payload)
        state.pagination.totalItems += 1
        toast.success('Tạo sản phẩm thành công!')
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update Product
    builder
      .addCase(updateProduct.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.products.findIndex(p => p.id === action.payload.id)

        if (index !== -1) {
          state.products[index] = action.payload
        }

        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload
        }

        toast.success('Cập nhật sản phẩm thành công!')
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Product
    builder
      .addCase(deleteProduct.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = state.products.filter(p => p.id !== Number(action.payload))
        state.pagination.totalItems -= 1
        toast.success('Xóa sản phẩm thành công!')
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Multiple Products
    builder
      .addCase(deleteMultipleProducts.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMultipleProducts.fulfilled, (state, action) => {
        state.isLoading = false
        const deletedIds = action.payload.map(id => String(id))

        state.products = state.products.filter(p => !deletedIds.includes(String(p.id)))
        state.pagination.totalItems -= action.payload.length
        toast.success(`Đã xóa ${action.payload.length} sản phẩm!`)
      })
      .addCase(deleteMultipleProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setFilters, clearSelectedProduct, clearError, resetProductState } = productSlice.actions
export default productSlice.reducer
