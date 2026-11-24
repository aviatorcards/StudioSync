import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { Providers } from '@/components/Providers'
import GoogleCastScript from '@/components/GoogleCastScript'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata')
    return {
        title: t('title'),
        description: t('description'),
        icons: {
            icon: process.env.NODE_ENV === 'development' ? '/logo-dev.svg' : '/logo.png',
            apple: '/logo.png'
        }
    }
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const locale = await getLocale()
    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${inter.className} antialiased`} suppressHydrationWarning>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Providers>
                        {children}
                    </Providers>
                </NextIntlClientProvider>
                <GoogleCastScript />
            </body>
        </html>
    )
}
