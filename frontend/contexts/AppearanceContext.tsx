'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useUser } from './UserContext'

interface AppearanceContextType {
    theme: 'light' | 'dark' | 'auto'
    colorScheme: 'default' | 'blue' | 'green' | 'purple'
    fontSize: 'small' | 'medium' | 'large'
    compactMode: boolean
}

const AppearanceContext = createContext<AppearanceContextType>({
    theme: 'light',
    colorScheme: 'default',
    fontSize: 'medium',
    compactMode: false
})

export function AppearanceProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useUser()

    const appearance: AppearanceContextType = {
        theme: currentUser?.preferences?.appearance?.theme || 'light',
        colorScheme: currentUser?.preferences?.appearance?.color_scheme || 'default',
        fontSize: currentUser?.preferences?.appearance?.font_size || 'medium',
        compactMode: currentUser?.preferences?.appearance?.compact_mode || false
    }

    useEffect(() => {
        // Only run on client-side
        if (typeof window === 'undefined') return

        // Apply theme
        if (appearance.theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else if (appearance.theme === 'auto') {
            // Use system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        } else {
            document.documentElement.classList.remove('dark')
        }

        // Apply color scheme as CSS variable
        const colorMap = {
            default: '#F39C12',
            blue: '#3498DB',
            green: '#27AE60',
            purple: '#9B59B6'
        }
        document.documentElement.style.setProperty('--primary-color', colorMap[appearance.colorScheme])

        // Apply font size
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
        }
        document.documentElement.style.setProperty('--base-font-size', fontSizeMap[appearance.fontSize])

        // Apply compact mode
        if (appearance.compactMode) {
            document.documentElement.classList.add('compact-mode')
        } else {
            document.documentElement.classList.remove('compact-mode')
        }
    }, [appearance.theme, appearance.colorScheme, appearance.fontSize, appearance.compactMode])

    return (
        <AppearanceContext.Provider value={appearance}>
            {children}
        </AppearanceContext.Provider>
    )
}

export function useAppearance() {
    return useContext(AppearanceContext)
}
