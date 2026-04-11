'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Components Imports
import RealDashboard from '@views/dashboard/RealDashboard'

// Hook Imports
import { useAuth } from '@/hooks/useAuth'

const DashboardAnalytics = () => {
  const router = useRouter()
  const { isAuthenticated, isCheckingAuth } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isCheckingAuth, router])

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <RealDashboard />
}

export default DashboardAnalytics
