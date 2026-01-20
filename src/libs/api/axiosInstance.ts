import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import toast from 'react-hot-toast'

import { BASE_URL, API_ENDPOINTS } from './endpoints'
import type { ApiError } from '@/types/api.types'

// Flag to prevent multiple refresh token requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically sent with withCredentials: true
    // No need to manually set Authorization header
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
axiosInstance.interceptors.response.use(
  response => {
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't modify the original request url check, just ensure we don't refresh if it's the refresh endpoint itself or login endpoint
      if (originalRequest.url?.includes('/users/login') || originalRequest.url?.includes('/users/refresh-token')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosInstance(originalRequest))
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh token
        await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
        processQueue(null)

        // Retry the original request
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)

        // Refresh failed - redirect to login
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')

        // Clear any local state and redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'

    switch (error.response?.status) {
      case 403:
        toast.error('Bạn không có quyền thực hiện thao tác này.')
        break
      case 404:
        toast.error('Không tìm thấy dữ liệu yêu cầu.')
        break
      case 422:
        // Validation errors - let the calling code handle specific field errors
        toast.error(errorMessage)
        break
      case 500:
      case 502:
      case 503:
        toast.error('Lỗi server. Vui lòng thử lại sau.')
        break

      default:
        if (!error.response) {
          toast.error('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.')
        } else {
          toast.error(errorMessage)
        }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
