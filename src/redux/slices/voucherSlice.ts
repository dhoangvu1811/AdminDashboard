import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { voucherService } from '@/services/voucherService'
import type {
  Voucher,
  VoucherState,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherFilters,
  DeleteMultipleVouchersPayload
} from '@/types/voucher.types'

// =========================================
// Initial State
// =========================================

const initialState: VoucherState = {
  vouchers: [],
  selectedVoucher: null,
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

// =========================================
// Async Thunks
// =========================================

export const fetchVouchers = createAsyncThunk(
  'vouchers/fetchAll',
  async (filters: VoucherFilters = {}, { rejectWithValue }) => {
    try {
      const response = await voucherService.getAll(filters)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiPagination = response.data.pagination as any

      const pagination = {
        page: apiPagination.page,
        itemsPerPage: apiPagination.itemsPerPage,
        totalItems: apiPagination.totalItems,
        totalPages: apiPagination.totalPages,
        hasNextPage: apiPagination.hasNextPage,
        hasPrevPage: apiPagination.hasPrevPage
      }

      return { vouchers: response.data.vouchers, pagination, filters }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách voucher')
    }
  }
)

export const getVoucherDetails = createAsyncThunk(
  'vouchers/getDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await voucherService.getById(id)

      return response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải chi tiết voucher')
    }
  }
)

export const createVoucher = createAsyncThunk(
  'vouchers/create',
  async (payload: CreateVoucherPayload, { rejectWithValue }) => {
    try {
      const response = await voucherService.create(payload)

      return response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo voucher')
    }
  }
)

export const updateVoucher = createAsyncThunk(
  'vouchers/update',
  async ({ id, payload }: { id: number | string; payload: UpdateVoucherPayload }, { rejectWithValue }) => {
    try {
      const response = await voucherService.update(id, payload)

      return response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật voucher')
    }
  }
)

export const deleteVoucher = createAsyncThunk('vouchers/delete', async (id: number | string, { rejectWithValue }) => {
  try {
    await voucherService.delete(id)

    return id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa voucher')
  }
})

export const deleteMultipleVouchers = createAsyncThunk(
  'vouchers/deleteMultiple',
  async (payload: DeleteMultipleVouchersPayload, { rejectWithValue }) => {
    try {
      await voucherService.deleteMultiple(payload)

      return payload.voucherIds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa nhiều voucher')
    }
  }
)

// =========================================
// Slice
// =========================================

const voucherSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {
    setVoucherFilters: (state, action: PayloadAction<VoucherFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearVoucherErrors: state => {
      state.error = null
    },
    setSelectedVoucher: (state, action: PayloadAction<Voucher | null>) => {
      state.selectedVoucher = action.payload
    }
  },
  extraReducers: builder => {
    // Fetch All
    builder
      .addCase(fetchVouchers.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.isLoading = false
        state.vouchers = action.payload.vouchers
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Details
    builder
      .addCase(getVoucherDetails.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getVoucherDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedVoucher = action.payload
      })
      .addCase(getVoucherDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create
    builder
      .addCase(createVoucher.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.isLoading = false
        state.vouchers.unshift(action.payload)
        state.pagination.totalItems += 1
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update
    builder
      .addCase(updateVoucher.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.vouchers.findIndex(v => v.id === action.payload.id)

        if (index !== -1) {
          state.vouchers[index] = action.payload
        }

        if (state.selectedVoucher?.id === action.payload.id) {
          state.selectedVoucher = action.payload
        }
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete
    builder
      .addCase(deleteVoucher.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.isLoading = false
        state.vouchers = state.vouchers.filter(v => v.id !== Number(action.payload))
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1)
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete Multiple
    builder
      .addCase(deleteMultipleVouchers.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMultipleVouchers.fulfilled, (state, action) => {
        state.isLoading = false
        const deletedIds = action.payload.map(Number)

        state.vouchers = state.vouchers.filter(v => !deletedIds.includes(v.id))
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - deletedIds.length)
      })
      .addCase(deleteMultipleVouchers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setVoucherFilters, clearVoucherErrors, setSelectedVoucher } = voucherSlice.actions

export default voucherSlice.reducer
