'use client'

import { useState } from 'react'
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

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
                throw new Error('Failed to send reset email')
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-[#F8FAFC] to-gray-100">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-white shadow-xl shadow-gray-100 mb-6 border border-gray-50 transform hover:scale-110 transition-transform duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                        Lost Access?
                    </h1>
                    <p className="text-gray-500 font-medium px-4 leading-relaxed">
                        Enter your professional email address and we&apos;ll orchestrate a secure recovery link.
                    </p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />

                    {success ? (
                        <div className="text-center py-4 space-y-6">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-3xl bg-green-50 animate-bounce">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Email Dispatched</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed px-2">
                                    We&apos;ve sent a password reset link to <span className="text-gray-900 font-bold underline decoration-primary/30 underline-offset-4">{email}</span>
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center gap-2 text-sm font-black text-primary hover:gap-3 transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    RETURN TO SIGN IN
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">{error}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Professional Email</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-300 group-focus-within/input:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-gray-900 text-sm transition-all shadow-sm focus:shadow-xl focus:shadow-primary/5"
                                        placeholder="you@studio.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative group/btn overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>AUTHORIZING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>SEND RECOVERY LINK</span>
                                        </>
                                    )}
                                </button>

                                <Link
                                    href="/login"
                                    className="block text-center text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                                >
                                    Cancel and return to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
