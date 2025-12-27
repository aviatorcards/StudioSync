'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>

                <p className="text-gray-600">
                    Thank you for your payment. Your transaction has been completed successfully.
                    {sessionId && <span className="block mt-2 text-xs text-gray-400">Ref: {sessionId.slice(0, 10)}...</span>}
                </p>

                <div className="pt-4">
                    <Link href="/dashboard/billing" className="w-full">
                        <Button className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Billing
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
