'use client'

import { ReactNode, useEffect } from 'react'
import { UserProvider } from '@/contexts/UserContext'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'
import usertour from 'usertour.js'

/**
 * Combined providers component for the application.
 * Wraps the app with all necessary context providers.
 */
export function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_USERTOUR_TOKEN
        const host = process.env.NEXT_PUBLIC_USERTOUR_HOST

        if (host && typeof window !== 'undefined') {
            // Configure usertour for self-hosted instance
            // We cast to any because these are custom environment variables for the SDK
            (window as any).USERTOURJS_ENV_VARS = {
                WS_URI: host.endsWith('/') ? host : `${host}/`,
                ASSETS_URI: host.endsWith('/') ? `${host}sdk/` : `${host}/sdk/`,
                USERTOURJS_ES2020_URL: host.endsWith('/') ? `${host}sdk/es2020/usertour.js` : `${host}/sdk/es2020/usertour.js`,
                USERTOURJS_LEGACY_URL: host.endsWith('/') ? `${host}sdk/legacy/usertour.iife.js` : `${host}/sdk/legacy/usertour.iife.js`
            }
        }

        if (token) {
            usertour.init(token)
        }
    }, [])

    return (
        <UserProvider>
            <FeatureFlagProvider>
                {children}
            </FeatureFlagProvider>
        </UserProvider>
    )
}
