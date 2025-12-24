'use client'

import { XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>

                <p className="text-gray-600">
                    Your payment was cancelled and you have not been charged.
                </p>

                <div className="pt-4">
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gray-600 hover:bg-gray-700 transition-colors w-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Billing
                    </Link>
                </div>
            </div>
        </div>
    )
}
