'use client'

import { ReactNode } from 'react'
import { UserProvider } from '@/contexts/UserContext'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'

/**
 * Combined providers component for the application.
 * Wraps the app with all necessary context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <FeatureFlagProvider>
                {children}
            </FeatureFlagProvider>
        </UserProvider>
    )
}
