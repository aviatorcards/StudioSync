'use client'

import { ReactNode } from 'react'
import { UserProvider } from '@/contexts/UserContext'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'
import { LocaleSync } from '@/components/LocaleSync'

/**
 * Combined providers component for the application.
 * Wraps the app with all necessary context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <LocaleSync />
            <FeatureFlagProvider>
                {children}
            </FeatureFlagProvider>
        </UserProvider>
    )
}
