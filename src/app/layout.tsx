// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Providers
import { ReduxProvider } from '@/redux/provider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Dashboard for E-commerce Management'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastProvider />
        </ReduxProvider>
      </body>
    </html>
  )
}

export default RootLayout
