'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push('/login')
        }
    }, [currentUser, isLoading, router])

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-[#F39C12] animate-spin" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        return null
    }

    return <>{children}</>
}
