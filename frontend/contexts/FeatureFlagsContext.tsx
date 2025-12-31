'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface FeatureFlag {
  key: string
  value: boolean | string | number | object
  flag_type: 'boolean' | 'string' | 'number' | 'json'
}

interface FeatureFlagsContextType {
  flags: Record<string, any>
  isLoading: boolean
  isEnabled: (key: string) => boolean
  getValue: (key: string, defaultValue?: any) => any
  refresh: () => Promise<void>
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchFlags = useCallback(async () => {
    // Client-side only check
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // Check cache first (5 minute TTL)
    const cached = localStorage.getItem('feature_flags')
    const cacheTime = localStorage.getItem('feature_flags_time')
    const now = Date.now()

    if (cached && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
      setFlags(JSON.parse(cached))
      setIsLoading(false)
      return
    }

    // Fetch from API
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/feature-flags/flags/active/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        // Convert array to key-value map
        const flagsMap: Record<string, any> = {}
        data.forEach((flag: FeatureFlag) => {
          flagsMap[flag.key] = flag.value
        })

        setFlags(flagsMap)
        localStorage.setItem('feature_flags', JSON.stringify(flagsMap))
        localStorage.setItem('feature_flags_time', now.toString())
      }
    } catch (error) {
      console.error('Failed to fetch feature flags:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  const isEnabled = useCallback((key: string): boolean => {
    return flags[key] === true
  }, [flags])

  const getValue = useCallback((key: string, defaultValue: any = null): any => {
    return flags[key] !== undefined ? flags[key] : defaultValue
  }, [flags])

  const refresh = useCallback(async () => {
    localStorage.removeItem('feature_flags')
    localStorage.removeItem('feature_flags_time')
    await fetchFlags()
  }, [fetchFlags])

  return (
    <FeatureFlagsContext.Provider value={{ flags, isLoading, isEnabled, getValue, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext)
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider')
  }
  return context
}
