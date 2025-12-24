'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, Theme } from '@/lib/themes';

type StudioThemeContextType = {
    theme: Theme;
    studioName: string;
};

const StudioThemeContext = createContext<StudioThemeContextType | undefined>(undefined);

export function StudioThemeProvider({
    children,
    themeId = 'default',
    studioName
}: {
    children: React.ReactNode;
    themeId?: string;
    studioName: string;
}) {
    const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[themeId] || THEMES.default);

    useEffect(() => {
        const theme = THEMES[themeId] || THEMES.default;
        setCurrentTheme(theme);

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        return () => {
            // Potentially reset to default if needed, 
            // but usually the next navigation will handle it
        };
    }, [themeId]);

    return (
        <StudioThemeContext.Provider value={{ theme: currentTheme, studioName }}>
            {children}
        </StudioThemeContext.Provider>
    );
}

export function useStudioTheme() {
    const context = useContext(StudioThemeContext);
    if (context === undefined) {
        throw new Error('useStudioTheme must be used within a StudioThemeProvider');
    }
    return context;
}
