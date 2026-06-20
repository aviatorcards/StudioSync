'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, Check, Music2 } from 'lucide-react'
import { Logo } from '@/components/Logo'

const A = {
    bg: '#faf7f2',
    card: '#ffffff',
    panel: '#1c1309',
    border: '#e3d4bc',
    amber: '#c17c2e',
    amberDark: '#9e6020',
    amberLight: 'rgba(193,124,46,0.12)',
    text: '#1c1309',
    muted: '#7a6145',
    faint: '#b09870',
    panelText: 'rgba(250,247,242,0.9)',
    panelMuted: 'rgba(250,247,242,0.55)',
} as const

const staffLines: React.CSSProperties = {
    backgroundImage: `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 27px,
        rgba(193,124,46,0.07) 27px,
        rgba(193,124,46,0.07) 28px
    )`,
}

const inp = 'block w-full py-2.5 rounded-xl border text-sm transition-all outline-none'
const inpStyle = (A: any) => ({
    paddingLeft: '2.375rem',
    paddingRight: '0.875rem',
    backgroundColor: A.bg,
    borderColor: A.border,
    color: A.text,
})
const inpPlain = (A: any) => ({
    padding: '0.625rem 0.875rem',
    backgroundColor: A.bg,
    borderColor: A.border,
    color: A.text,
})

export default function SignupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', role: 'student',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('starter')

    useEffect(() => {
        const plan = searchParams.get('plan')
        if (plan) setSelectedPlan(plan)
    }, [searchParams])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

    const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = A.amber
        e.currentTarget.style.backgroundColor = '#fff'
        e.currentTarget.style.boxShadow = `0 0 0 3px ${A.amberLight}`
    }
    const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = A.border
        e.currentTarget.style.backgroundColor = A.bg
        e.currentTarget.style.boxShadow = 'none'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
        if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return }
        setLoading(true)
        try {
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    role: formData.role,
                }),
            })
            if (response.ok) {
                router.push('/login?registered=true')
            } else {
                const data = await response.json()
                setError(data.error || data.detail || data.email?.[0] || 'Registration failed')
            }
        } catch {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: A.bg }}>
            {/* Left panel */}
            <div
                className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ backgroundColor: A.panel, ...staffLines }}
            >
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(193,124,46,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
                />

                <Link href="/" className="flex items-center gap-2.5 relative z-10">
                    <Logo className="w-9 h-9" />
                    <span className="text-lg font-bold" style={{ color: A.panelText, fontFamily: 'Outfit, sans-serif' }}>
                        StudioSync
                    </span>
                </Link>

                <div className="relative z-10 space-y-6">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                        style={{ backgroundColor: A.amberLight, border: '1px solid rgba(193,124,46,0.2)' }}
                    >
                        <Music2 className="w-6 h-6" style={{ color: A.amber }} />
                    </div>
                    <h1
                        className="text-4xl font-extrabold leading-tight"
                        style={{ color: A.panelText, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}
                    >
                        Built for musicians, not bookers.
                    </h1>
                    <p className="text-lg leading-relaxed" style={{ color: A.panelMuted }}>
                        Bands set their own availability. Studios post gigs. Everyone gets paid fairly.
                    </p>
                    <div className="space-y-3 pt-2">
                        {[
                            'Gig marketplace with built-in pay scales',
                            'Bands control their own schedule',
                            'No middleman, no booking fees',
                            'Free and open source',
                        ].map((t) => (
                            <div key={t} className="flex items-center gap-3">
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: A.amberLight }}
                                >
                                    <Check className="w-3 h-3" style={{ color: A.amber }} />
                                </div>
                                <span className="text-sm" style={{ color: A.panelMuted }}>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs relative z-10" style={{ color: 'rgba(250,247,242,0.25)' }}>
                    © StudioSync · Open source · GPL-3.0
                </p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto" style={{ backgroundColor: A.bg }}>
                <div className="w-full max-w-md py-6">
                    {/* Mobile logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
                        <Logo className="w-9 h-9" />
                        <span className="text-lg font-bold" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>StudioSync</span>
                    </Link>

                    <div
                        className="rounded-2xl p-8 shadow-sm"
                        style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: '0 4px 32px rgba(28,19,9,0.06)' }}
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-1" style={{ color: A.text, fontFamily: 'Outfit, sans-serif' }}>
                                Create your account
                            </h2>
                            <p className="text-sm" style={{ color: A.muted }}>
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold transition-colors"
                                    style={{ color: A.amber }}
                                    onMouseEnter={e => (e.currentTarget.style.color = A.amberDark)}
                                    onMouseLeave={e => (e.currentTarget.style.color = A.amber)}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {selectedPlan && selectedPlan !== 'starter' && (
                            <div className="mb-5 p-3.5 rounded-xl" style={{ backgroundColor: A.amberLight, border: `1px solid ${A.border}` }}>
                                <p className="text-sm font-semibold" style={{ color: A.text }}>
                                    Selected plan:{' '}
                                    <span className="capitalize" style={{ color: A.amber }}>{selectedPlan}</span>
                                </p>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm" style={{ backgroundColor: 'rgba(181,64,64,0.06)', border: '1px solid rgba(181,64,64,0.2)', color: '#b54040' }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Name row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="firstName" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-4 w-4" style={{ color: A.faint }} />
                                        </div>
                                        <input
                                            id="firstName" name="firstName" type="text" required
                                            value={formData.firstName} onChange={handleChange}
                                            className={inp} style={inpStyle(A)}
                                            onFocus={focusStyle} onBlur={blurStyle}
                                            placeholder="First"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName" name="lastName" type="text" required
                                        value={formData.lastName} onChange={handleChange}
                                        className={inp} style={inpPlain(A)}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                        placeholder="Last"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4" style={{ color: A.faint }} />
                                    </div>
                                    <input
                                        id="email" name="email" type="email" required
                                        value={formData.email} onChange={handleChange}
                                        className={inp} style={inpStyle(A)}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                    I am a
                                </label>
                                <select
                                    id="role" name="role"
                                    value={formData.role} onChange={handleChange}
                                    className={inp} style={inpPlain(A)}
                                    onFocus={focusStyle} onBlur={blurStyle}
                                >
                                    <option value="student">Musician / Student</option>
                                    <option value="teacher">Instructor</option>
                                    <option value="parent">Parent</option>
                                    <option value="staff">Studio Staff</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4" style={{ color: A.faint }} />
                                    </div>
                                    <input
                                        id="password" name="password" type="password" required
                                        value={formData.password} onChange={handleChange}
                                        className={inp} style={inpStyle(A)}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="mt-1 text-xs" style={{ color: A.faint }}>At least 8 characters</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4" style={{ color: A.faint }} />
                                    </div>
                                    <input
                                        id="confirmPassword" name="confirmPassword" type="password" required
                                        value={formData.confirmPassword} onChange={handleChange}
                                        className={inp} style={inpStyle(A)}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: A.amber, color: '#fff' }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = A.amberDark }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = A.amber }}
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : <>Create account <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs" style={{ color: A.faint }}>
                            By signing up, you agree to our{' '}
                            <Link href="/terms" style={{ color: A.muted }} className="hover:underline">Terms</Link>
                            {' '}and{' '}
                            <Link href="/privacy" style={{ color: A.muted }} className="hover:underline">Privacy Policy</Link>
                        </p>
                    </div>

                    <div className="mt-5 text-center">
                        <Link
                            href="/"
                            className="text-sm transition-colors inline-flex items-center gap-1"
                            style={{ color: A.faint }}
                            onMouseEnter={e => (e.currentTarget.style.color = A.muted)}
                            onMouseLeave={e => (e.currentTarget.style.color = A.faint)}
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
