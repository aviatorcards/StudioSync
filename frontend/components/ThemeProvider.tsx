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

        // Apply color-scheme CSS variables only.
        // Do NOT touch the 'dark' class here — that is managed exclusively
        // by AppearanceProvider based on the user's theme preference.
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

    }, [theme]);

    return <>{children}</>;
}
