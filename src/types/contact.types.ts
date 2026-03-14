export interface ContactItem {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  message: string
  isReply: boolean
  createdAt: string
}

export interface ContactPagination {
  page: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ContactListData {
  contacts: ContactItem[]
  pagination: ContactPagination
}

export interface ContactFilters {
  page?: number
  limit?: number
  status?: 'all' | 'replied' | 'pending'
}

export interface ReplyContactPayload {
  subject?: string
  message: string
}

export interface ReplyContactData {
  contact: ContactItem
  repliedEmail: string
}
