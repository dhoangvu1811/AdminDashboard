import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

import contactService from '@/services/contactService'
import type { ContactFilters, ContactItem, ContactPagination, ReplyContactPayload } from '@/types/contact.types'

interface ContactState {
  contacts: ContactItem[]
  pagination: ContactPagination
  isLoading: boolean
  replyingContactId: number | null
  error: string | null
}

const initialState: ContactState = {
  contacts: [],
  pagination: {
    page: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  isLoading: false,
  replyingContactId: null,
  error: null
}

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (params: ContactFilters = {}, { rejectWithValue }) => {
    try {
      return await contactService.getAll(params)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách liên hệ')
    }
  }
)

export const replyContact = createAsyncThunk(
  'contacts/reply',
  async ({ id, payload }: { id: number; payload: ReplyContactPayload }, { rejectWithValue }) => {
    try {
      const data = await contactService.reply(id, payload)

      return { id, data }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể gửi phản hồi')
    }
  }
)

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearContactError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchContacts.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false
        state.contacts = action.payload.contacts
        state.pagination = action.payload.pagination
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

    builder
      .addCase(replyContact.pending, (state, action) => {
        state.replyingContactId = action.meta.arg.id
        state.error = null
      })
      .addCase(replyContact.fulfilled, (state, action) => {
        state.replyingContactId = null

        const updatedContact = action.payload.data.contact
        const idx = state.contacts.findIndex(c => c.id === updatedContact.id)

        if (idx !== -1) {
          state.contacts[idx] = updatedContact
        }

        toast.success('Phản hồi liên hệ thành công')
      })
      .addCase(replyContact.rejected, (state, action) => {
        state.replyingContactId = null
        state.error = action.payload as string
        toast.error(action.payload as string)
      })
  }
})

export const { clearContactError } = contactSlice.actions
export default contactSlice.reducer
