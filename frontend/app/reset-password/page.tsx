'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { motion, AnimatePresence } from 'framer-motion'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const uid = searchParams.get('uid')
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Password validation states
    const hasMinLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const passwordsMatch = password && password === confirmPassword

    useEffect(() => {
        if (!uid || !token) {
            setError('Invalid or missing reset token. Please request a new link.')
        }
    }, [uid, token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!passwordsMatch) {
            setError('Passwords do not match')
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/password/reset/confirm/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token, password })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || data.detail || 'Failed to reset password. The link may have expired.')
            }

            setSuccess(true)
            setTimeout(() => router.push('/login'), 3000)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-6 space-y-6">
                <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Updated</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Your password has been changed successfully. <br />
                        Redirecting you to login...
                    </p>
                </div>
            </div>
        )
    }

    if (!uid || !token) {
        return (
            <div className="text-center py-6 space-y-6">
                <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 text-red-600">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        This recovery link is invalid or has expired.
                    </p>
                </div>
                <div className="pt-4">
                    <Link
                        href="/forgot-password"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                    >
                        Request new link
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:bg-white rounded-xl outline-none font-medium text-gray-900 text-sm transition-all shadow-sm"
                            placeholder="Min 8 characters"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:border-indigo-600 focus:bg-white rounded-xl outline-none font-medium text-gray-900 text-sm transition-all shadow-sm"
                            placeholder="Repeat password"
                        />
                    </div>
                </div>
            </div>

            {/* Password Rules */}
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                {[
                    { label: '8+ Characters', met: hasMinLength },
                    { label: 'Uppercase', met: hasUpperCase },
                    { label: 'Number', met: hasNumber },
                    { label: 'Matches', met: passwordsMatch }
                ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${rule.met ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className={`text-[11px] font-bold ${rule.met ? 'text-gray-900' : 'text-gray-400'}`}>
                            {rule.label}
                        </span>
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={isLoading || !passwordsMatch || !hasMinLength}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                    </>
                ) : (
                    <span>Reset Password</span>
                )}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2" />

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
                            Set new password
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Choose a strong password to protect your account.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100"
                >
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initializing...</p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </motion.div>

                <p className="mt-8 text-center text-xs text-gray-400">
                    Remember your password?{' '}
                    <Link href="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
