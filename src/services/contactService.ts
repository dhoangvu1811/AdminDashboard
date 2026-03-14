import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import type { ContactFilters, ContactListData, ReplyContactData, ReplyContactPayload } from '@/types/contact.types'

const contactService = {
  getAll: async (params: ContactFilters = {}): Promise<ContactListData> => {
    const response = await axiosInstance.get<ApiResponse<ContactListData>>(API_ENDPOINTS.CONTACTS.ALL, { params })

    return response.data.data
  },

  reply: async (id: number | string, payload: ReplyContactPayload): Promise<ReplyContactData> => {
    const response = await axiosInstance.post<ApiResponse<ReplyContactData>>(API_ENDPOINTS.CONTACTS.REPLY(id), payload)

    return response.data.data
  }
}

export default contactService
