import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import categoryService from '@/services/categoryService'
import type {
  Category,
  CategoryState,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryFilters,
  DeleteMultipleCategoriesPayload
} from '@/types/category.types'

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
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
  error: null
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (filters: CategoryFilters = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAll(filters)

      const apiPagination = response.data.pagination as any

      const pagination = {
        page: apiPagination.page,
        itemsPerPage: apiPagination.itemsPerPage,
        totalItems: apiPagination.totalItems,
        totalPages: apiPagination.totalPages,
        hasNextPage: apiPagination.hasNextPage,
        hasPrevPage: apiPagination.hasPrevPage
      }

      return { categories: response.data.categories, pagination, filters }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách danh mục')
    }
  }
)

export const getCategoryDetails = createAsyncThunk(
  'categories/getDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await categoryService.getById(id)

      
return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải chi tiết danh mục')
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(payload)

      
return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo danh mục')
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, payload }: { id: number | string; payload: UpdateCategoryPayload }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, payload)

      
return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật danh mục')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await categoryService.delete(id)
      
return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa danh mục')
    }
  }
)

export const deleteMultipleCategories = createAsyncThunk(
  'categories/deleteMultiple',
  async (payload: DeleteMultipleCategoriesPayload, { rejectWithValue }) => {
    try {
      await categoryService.deleteMultiple(payload)
      
return payload.ids
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa nhiều danh mục')
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategoryFilters: (state, action: PayloadAction<CategoryFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCategoryErrors: state => {
      state.error = null
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload
    }
  },
  extraReducers: builder => {
    // Fetch All
    builder
      .addCase(fetchCategories.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.categories
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Details
    builder
      .addCase(getCategoryDetails.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCategoryDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedCategory = action.payload
      })
      .addCase(getCategoryDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create
    builder
      .addCase(createCategory.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update
    builder
      .addCase(updateCategory.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.categories.findIndex(c => c.id === action.payload.id)

        if (index !== -1) {
          state.categories[index] = action.payload
        }

        if (state.selectedCategory?.id === action.payload.id) {
          state.selectedCategory = action.payload
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete
    builder
      .addCase(deleteCategory.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = state.categories.filter(c => c.id !== Number(action.payload))
        state.pagination.totalItems -= 1
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Multiple
    builder
      .addCase(deleteMultipleCategories.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMultipleCategories.fulfilled, (state, action) => {
        state.isLoading = false
        const ids = action.payload

        state.categories = state.categories.filter(c => !ids.includes(c.id))
        state.pagination.totalItems -= ids.length
      })
      .addCase(deleteMultipleCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setCategoryFilters, clearCategoryErrors, setSelectedCategory } = categorySlice.actions
export default categorySlice.reducer
