'use client'

import { useState } from 'react'
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { motion } from 'framer-motion'

const A = {
    bg: '#faf7f2',
    card: '#ffffff',
    border: '#e3d4bc',
    amber: '#c17c2e',
    amberDark: '#9e6020',
    amberLight: 'rgba(193,124,46,0.12)',
    text: '#1c1309',
    muted: '#7a6145',
    faint: '#b09870',
} as const

const staffLines: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 27px,
        rgba(193,124,46,0.09) 27px,
        rgba(193,124,46,0.09) 28px
    )`,
}

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
            const res = await fetch('/api/auth/password/reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            if (!res.ok) throw new Error('No account found with this email address')
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{ backgroundColor: A.bg, ...staffLines }}
        >
            {/* Subtle amber glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(193,124,46,0.07) 0%, transparent 70%)' }}
            />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2.5 justify-center mb-8">
                        <Logo className="h-9 w-9" />
                        <span className="text-lg font-bold" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>StudioSync</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                    >
                        <h1 className="text-2xl font-bold mb-2" style={{ color: A.text, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                            Reset your password
                        </h1>
                        <p className="text-sm" style={{ color: A.muted }}>
                            We&apos;ll send you a link to get back into your account.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="rounded-2xl p-8"
                    style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: '0 4px 32px rgba(28,19,9,0.06)' }}
                >
                    {success ? (
                        <div className="text-center py-4 space-y-6">
                            <div
                                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(61,158,61,0.08)', border: '1px solid rgba(61,158,61,0.15)' }}
                            >
                                <CheckCircle className="w-8 h-8" style={{ color: '#3d9e3d' }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: A.text }}>Check your email</h3>
                                <p className="text-sm leading-relaxed" style={{ color: A.muted }}>
                                    We&apos;ve sent a reset link to{' '}
                                    <span className="font-semibold" style={{ color: A.text }}>{email}</span>
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                style={{ color: A.amber }}
                                onMouseEnter={e => (e.currentTarget.style.color = A.amberDark)}
                                onMouseLeave={e => (e.currentTarget.style.color = A.amber)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(181,64,64,0.06)', border: '1px solid rgba(181,64,64,0.2)', color: '#b54040' }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4" style={{ color: A.faint }} />
                                    </div>
                                    <input
                                        type="email" required
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                                        style={{ backgroundColor: A.bg, borderColor: A.border, color: A.text }}
                                        onFocus={e => { e.currentTarget.style.borderColor = A.amber; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(193,124,46,0.12)` }}
                                        onBlur={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.backgroundColor = A.bg; e.currentTarget.style.boxShadow = 'none' }}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                                style={{ backgroundColor: A.amber, color: '#fff' }}
                                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = A.amberDark }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = A.amber }}
                            >
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send reset link</>}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm font-semibold transition-colors"
                                    style={{ color: A.faint }}
                                    onMouseEnter={e => (e.currentTarget.style.color = A.muted)}
                                    onMouseLeave={e => (e.currentTarget.style.color = A.faint)}
                                >
                                    ← Back to sign in
                                </Link>
                            </div>
                        </form>
                    )}
                </motion.div>

                <p className="mt-6 text-center text-xs" style={{ color: A.faint }}>
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="font-semibold transition-colors"
                        style={{ color: A.amber }}
                        onMouseEnter={e => (e.currentTarget.style.color = A.amberDark)}
                        onMouseLeave={e => (e.currentTarget.style.color = A.amber)}
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
