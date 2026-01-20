'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Provider } from 'react-redux'

import { store } from './store'
import { injectStore, setLogoutCallback } from '@/libs/api'

interface ReduxProviderProps {
  children: React.ReactNode
}

// Component để setup logout callback với router
function AxiosSetup() {
  const router = useRouter()

  useEffect(() => {
    // Inject store vào axios instance
    injectStore(store)

    // Set logout callback để redirect đến login page
    setLogoutCallback(() => {
      router.push('/login')
    })
  }, [router])

  return null
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AxiosSetup />
      {children}
    </Provider>
  )
}
