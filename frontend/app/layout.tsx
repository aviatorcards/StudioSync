import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/contexts/UserContext'
import GoogleCastScript from '@/components/GoogleCastScript'

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

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <UserProvider>
                    {children}
                </UserProvider>
                <GoogleCastScript />
            </body>
        </html>
    )
}
