'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { FeatureFlags, DEFAULT_FEATURES } from '@/types/setup'

interface FeatureFlagContextType {
    flags: FeatureFlags
    isLoading: boolean
    refresh: () => Promise<void>
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * Maps the backend's features_enabled shape to our FeatureFlags type.
 * Backend stores: { billing: true, inventory: false, ... }
 * Frontend type uses: { billing_enabled: true, inventory_enabled: false, ... }
 */
function mapBackendFeatures(raw: Record<string, boolean>): Partial<FeatureFlags> {
    const mapped: Partial<FeatureFlags> = {}
    const featureKeys: (keyof FeatureFlags)[] = [
        'billing_enabled', 'inventory_enabled', 'messaging_enabled',
        'resources_enabled', 'goals_enabled', 'bands_enabled',
        'analytics_enabled', 'practice_rooms_enabled',
    ]
    for (const key of featureKeys) {
        const backendKey = key.replace('_enabled', '')
        if (backendKey in raw) {
            // Backend stores without suffix: { billing: true }
            mapped[key] = raw[backendKey]
        } else if (key in raw) {
            // Fallback: backend stores with suffix: { billing_enabled: true }
            mapped[key] = raw[key as string]
        }
    }
    return mapped
}

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
    const { currentUser } = useUser()
    const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURES)
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        // Feature flags are stored in SetupStatus.features_enabled (JSONField).
        // The FeatureFlag model was removed in migration 0011; flags now come
        // from the setup/status/ endpoint which is AllowAny — no auth needed.
        try {
            const res = await fetch(`${API_URL}/core/setup/status/`, {
                credentials: 'include',
            })

            if (res.ok) {
                const data = await res.json()
                if (data.features_enabled && typeof data.features_enabled === 'object') {
                    setFlags({ ...DEFAULT_FEATURES, ...mapBackendFeatures(data.features_enabled) })
                }
                // If setup isn't complete yet, DEFAULT_FEATURES is the correct fallback
            }
        } catch (err) {
            console.error('Failed to load feature flags:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    // Re-fetch once the user loads (in case they just completed setup)
    useEffect(() => {
        if (currentUser) refresh()
    }, [currentUser, refresh])

    return (
        <FeatureFlagContext.Provider value={{ flags, isLoading, refresh }}>
            {children}
        </FeatureFlagContext.Provider>
    )
}

export function useFeatureFlagContext() {
    const ctx = useContext(FeatureFlagContext)
    if (!ctx) throw new Error('useFeatureFlagContext must be used within FeatureFlagProvider')
    return ctx
}
