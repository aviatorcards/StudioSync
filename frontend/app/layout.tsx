import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'StudioSync - Music Studio Management',
    description: 'Sync your studio, students, and schedule — all in one place',
    icons: {
        icon: process.env.NODE_ENV === 'development' ? '/logo-dev.svg' : '/favicon.ico',
        apple: '/logo.png'
    }
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

import GoogleCastScript from '@/components/GoogleCastScript'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <UserProvider>
                    {children}
                </UserProvider>
                <GoogleCastScript />
            </body>
        </html>
    )
}
