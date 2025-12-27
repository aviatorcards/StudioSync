'use client'

import { useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import AuthGuard from '@/components/auth/AuthGuard'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AppearanceProvider } from '@/contexts/AppearanceContext'
import { CommandPalette } from '@/components/CommandPalette'
import ColorSchemeProvider from '@/components/ColorSchemeProvider'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleCloseSidebar = useCallback(() => {
        setIsSidebarOpen(false)
    }, [])

    const handleOpenSidebar = useCallback(() => {
        setIsSidebarOpen(true)
    }, [])

    return (
        <AuthGuard>
            <ThemeProvider>
                <AppearanceProvider>
                    <ColorSchemeProvider>
                        <div className="flex h-screen bg-gray-50 overflow-x-hidden">
                            {/* Sidebar */}
                            <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col ml-0 md:ml-64 overflow-x-hidden w-full">
                                {/* Header */}
                                <DashboardHeader onMenuClick={handleOpenSidebar} />

                                {/* Page Content */}
                                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 w-full">
                                    {children}
                                </main>
                            </div>

                            {/* Global Command Palette */}
                            <CommandPalette />
                        </div>
                    </ColorSchemeProvider>
                </AppearanceProvider>
            </ThemeProvider>
        </AuthGuard>
    )
}
