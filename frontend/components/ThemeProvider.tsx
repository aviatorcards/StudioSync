'use client';

import { useSettings } from '@/hooks/useSettings';
import { THEMES } from '@/lib/themes';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { studio } = useSettings();
    const themeId = studio?.settings?.theme || 'default';
    const theme = THEMES[themeId] || THEMES.default;

    useEffect(() => {
        const root = document.documentElement;

        // Remove 'dark' class first
        root.classList.remove('dark');

        // Apply theme variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        // Handle specific theme classes if needed, but variables usually suffice
        // If "Midnight" or "Dark" themes set is_dark flag in their definition, we could use that.
        // For now, relies on base colors mapping.

    }, [theme]);

    return <>{children}</>;
}
