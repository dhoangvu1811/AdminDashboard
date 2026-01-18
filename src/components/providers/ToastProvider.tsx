'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position='top-right'
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20
      }}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        },

        // Success toast
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f8fafc'
          },
          style: {
            background: '#1e293b',
            border: '1px solid #22c55e30'
          }
        },

        // Error toast
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#f8fafc'
          },
          style: {
            background: '#1e293b',
            border: '1px solid #ef444430'
          }
        },

        // Loading toast
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#f8fafc'
          }
        }
      }}
    />
  )
}
