'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get tokens from URL params
    const uid = searchParams.get('uid')
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    if (!uid || !token) {
        return (
            <div className="text-center py-6 space-y-6">
                <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-red-50 border border-red-100 mb-4 animate-pulse">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Access Revoked</h3>
                    <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                        This recovery link has expired or is cryptographically invalid.
                    </p>
                </div>
                <div className="pt-4">
                    <Link
                        href="/forgot-password"
                        className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('http://localhost:8000/api/auth/password/reset/confirm/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token, password })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to reset password')
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-6 space-y-8">
                <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-[3rem] bg-green-50 animate-in zoom-in duration-500">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Vault Secured</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Your professional credentials have been successfully updated.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href="/login"
                        className="w-full flex justify-center py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 items-center gap-3 active:scale-[0.98]"
                    >
                        Enter Terminal
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">New Secure Password</label>
                    <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-300 group-focus-within/input:text-primary transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-gray-900 text-sm transition-all shadow-sm focus:shadow-xl focus:shadow-primary/5"
                            placeholder="Min. 8 characters"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Confirm Identity</label>
                    <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <ShieldCheck className="h-5 w-5 text-gray-300 group-focus-within/input:text-primary transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[1.5rem] outline-none font-bold text-gray-900 text-sm transition-all shadow-sm focus:shadow-xl focus:shadow-primary/5"
                            placeholder="Match passwords"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group/btn overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>RESETTING VAULT...</span>
                    </>
                ) : (
                    <>
                        <KeyRound className="w-4 h-4" />
                        <span>UPDATE PASSWORD</span>
                    </>
                )}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white via-[#F8FAFC] to-gray-100">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-white shadow-xl shadow-gray-100 mb-6 border border-gray-50">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                        Set New Password
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Create a strong, unique password to protect your professional studio workspace.
                    </p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Calibrating access...</p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
