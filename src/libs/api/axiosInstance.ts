import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { Store } from '@reduxjs/toolkit'

import { BASE_URL, API_ENDPOINTS } from './endpoints'
import type { ApiError } from '@/types/api.types'

// Types
type LogoutCallback = () => void

// Extended request config for retry tracking
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _isRetrying?: boolean
}

/**
 * Inject Store Pattern
 * Không thể import {store} từ '@/redux/store' theo cách thông thường ở đây
 * vì sẽ gây circular dependency. Giải pháp: Inject store từ bên ngoài.
 */
let axiosReduxStore: Store | null = null
let logoutCallback: LogoutCallback | null = null

/**
 * Inject Redux store vào axios instance
 * Gọi hàm này từ provider hoặc app initialization
 */
export const injectStore = (mainStore: Store): void => {
  axiosReduxStore = mainStore
}

/**
 * Set callback function khi logout (ví dụ: redirect đến login page)
 */
export const setLogoutCallback = (callback: LogoutCallback): void => {
  logoutCallback = callback
}

/**
 * Helper function để dispatch logout action và cleanup
 */
const dispatchLogout = (): void => {
  if (axiosReduxStore) {
    // Import clearAuth dynamically để tránh circular dependency
    import('@/redux/slices/authSlice').then(({ clearAuth }) => {
      axiosReduxStore?.dispatch(clearAuth())
    })

    // Gọi API logout để cleanup backend - sử dụng axios base để tránh interceptor
    axios.post(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {}, { withCredentials: true }).catch(() => {
      // Silent error - không cần show error nếu logout API fail
      // Vì user đã bị logout tự động do token hết hạn
    })
  }

  // Gọi callback nếu có (ví dụ: redirect đến login page)
  if (logoutCallback) {
    logoutCallback()
  } else if (typeof window !== 'undefined') {
    // Fallback: redirect trực tiếp nếu không có callback
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    window.location.href = '/login'
  }
}

// Quản lý refresh token promise
let refreshTokenPromise: Promise<void> | null = null

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Cookies are automatically sent with withCredentials: true
    // No need to manually set Authorization header
    return config
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error)
  }
)

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  (error: AxiosError<ApiError>): Promise<never> => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined

    /**
     * Xử lý 401 Unauthorized - Token không hợp lệ hoặc không có quyền
     * Logout user ngay lập tức
     */
    if (error.response?.status === 401) {
      dispatchLogout()

      return Promise.reject(error)
    }

    /**
     * Xử lý 410 GONE - Access Token hết hạn
     * Gọi API refresh token để làm mới lại accessToken
     */
    if (error.response?.status === 410 && originalRequest) {
      // Kiểm tra nếu request đã được retry trước đó để tránh infinity loop
      if (originalRequest._isRetrying) {
        // Nếu đã retry rồi mà vẫn lỗi 410, logout user
        dispatchLogout()

        return Promise.reject(error)
      }

      // Đánh dấu request này đang được retry
      originalRequest._isRetrying = true

      if (!refreshTokenPromise) {
        // Gọi API refresh token - sử dụng axios trực tiếp để tránh circular dependency
        refreshTokenPromise = axios
          .post<void>(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {}, { withCredentials: true })
          .then(() => {
            // Token được update tự động trong cookie bởi backend
          })
          .catch((_error: AxiosError) => {
            // Refresh failed - logout user
            dispatchLogout()

            return Promise.reject(_error)
          })
          .finally(() => {
            refreshTokenPromise = null
          })
      }

      // Return lại refreshTokenPromise, khi thành công sẽ retry original request
      return refreshTokenPromise.then(() => {
        return axiosInstance(originalRequest) as Promise<never>
      })
    }

    // Xử lý lỗi tập trung - hiển thị thông báo lỗi từ API
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'

    // Không show toast cho lỗi 410 (đã xử lý refresh token)
    if (error.response?.status !== 410) {
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
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
