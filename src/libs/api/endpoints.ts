// API Endpoints Configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8017/V1'

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token'
  },

  // User Management
  USERS: {
    ALL: '/users/all',
    OVERVIEW: '/users/overview',
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
    DETAILS: (id: number | string) => `/users/details/${id}`,
    CREATE: '/users/create',
    UPDATE: (id: number | string) => `/users/update/${id}`,
    DELETE: (id: number | string) => `/users/delete/${id}`,
    DELETE_MULTIPLE: '/users/delete-multiple',
    ACTIVATE: (id: number | string) => `/users/activate/${id}`,
    DEACTIVATE: (id: number | string) => `/users/deactivate/${id}`,
    CHANGE_ROLE: (id: number | string) => `/users/${id}/role`
  },

  // Session Management
  SESSIONS: {
    GET_USER_SESSIONS: (userId: number | string) => `/users/sessions/${userId}`,
    REVOKE_SESSION: '/users/revoke-session',
    REVOKE_ALL_SESSIONS: (userId: number | string) => `/users/revoke-all-sessions/${userId}`
  },

  // Product Management
  PRODUCTS: {
    ALL: '/products/getAll',

    DETAILS: (id: number | string) => `/products/details/${id}`,
    CREATE: '/products/create',
    UPDATE: (id: number | string) => `/products/update/${id}`,
    DELETE: (id: number | string) => `/products/delete/${id}`,
    DELETE_MULTIPLE: '/products/deleteSelected',
    UPLOAD_IMAGE: '/products/upload-image'
  },

  // Category Management
  CATEGORIES: {
    ALL: '/categories',
    DETAILS: (id: number | string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: number | string) => `/categories/${id}`,
    DELETE: (id: number | string) => `/categories/${id}`,
    DELETE_MANY: '/categories/delete-many'
  },

  // Order Management
  ORDERS: {
    ALL: '/orders/all',
    DETAILS: (id: number | string) => `/orders/admin/details/${id}`,
    UPDATE_STATUS: (id: number | string) => `/orders/admin/update/${id}`,
    UPDATE_PAYMENT: (id: number | string) => `/orders/admin/update-payment/${id}`,
    MARK_PAID: (id: number | string) => `/orders/admin/mark-paid/${id}`,
    CANCEL: (id: number | string) => `/orders/admin/cancel/${id}`,
    LOGS: (id: number | string) => `/orders/admin/logs/${id}`
  },

  // Voucher Management
  VOUCHERS: {
    ALL: '/vouchers/all',
    CREATE: '/vouchers/create',
    UPDATE: (id: number | string) => `/vouchers/update/${id}`,
    DELETE: (id: number | string) => `/vouchers/delete/${id}`
  },

  // Contact/Social
  CONTACTS: {
    ALL: '/contacts'
  },

  // Role Management
  ROLES: {
    ALL: '/roles',
    DETAILS: (id: number | string) => `/roles/${id}`,
    CREATE: '/roles',
    UPDATE: (id: number | string) => `/roles/${id}`,
    DELETE: (id: number | string) => `/roles/${id}`,
    // Role Permissions
    GET_PERMISSIONS: (id: number | string) => `/roles/${id}/permissions`,
    ASSIGN_PERMISSION: (id: number | string) => `/roles/${id}/permissions`,
    BULK_ASSIGN_PERMISSIONS: (id: number | string) => `/roles/${id}/permissions/bulk`,
    REMOVE_PERMISSION: (id: number | string, permissionId: number | string) =>
      `/roles/${id}/permissions/${permissionId}`
  },

  // Permission Management
  PERMISSIONS: {
    ALL: '/permissions',
    ME: '/permissions/me',
    DETAILS: (id: number | string) => `/permissions/${id}`,
    CREATE: '/permissions',
    UPDATE: (id: number | string) => `/permissions/${id}`,
    DELETE: (id: number | string) => `/permissions/${id}`
  }
} as const

export { BASE_URL }
