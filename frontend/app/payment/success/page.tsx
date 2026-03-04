'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import api from '@/services/api'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const [verifying, setVerifying] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!sessionId) {
            setVerifying(false)
            return
        }

        const verifySession = async () => {
            try {
                // Synchronously verify checkout so the db updates even if webhooks fail via CLI constraints
                await api.post('/billing/verify-checkout-session/', { session_id: sessionId })
            } catch (err: any) {
                console.error("Verification error:", err)
                // We do not strictly display an error on standard webhook setups because sometimes 
                // the session takes a moment for stripe to process, but we log it.
            } finally {
                setVerifying(false)
            }
        }
        
        verifySession()
    }, [sessionId])

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
