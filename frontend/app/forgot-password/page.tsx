'use client'

import { useState } from 'react'
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await fetch('http://localhost:8000/api/auth/password/reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (!res.ok) {
                throw new Error('No account found with this email address')
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-8">
                        <Logo className="h-10 w-auto" />
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
                            Reset your password
                        </h1>
                        <p className="text-gray-500 font-medium">
                            We&apos;ll send you a link to get back into your account.
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100"
                >
                    {success ? (
                        <div className="text-center py-4 space-y-6">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    We&apos;ve sent a password reset link to <br />
                                    <span className="text-gray-900 font-semibold">{email}</span>
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:bg-white rounded-xl outline-none font-medium text-gray-900 text-sm transition-all shadow-sm"
                                        placeholder="you@studio.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send reset link</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </motion.div>
                
                <p className="mt-8 text-center text-xs text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    )
}
