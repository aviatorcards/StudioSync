'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Music2 } from 'lucide-react'
import Link from 'next/link'
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

const DEMO_USERS = [
    { label: 'Teacher', email: 'teacher1@test.com', password: 'teacher123' },
    { label: 'Student', email: 'gig_student1@test.com', password: 'student123' },
] as const

export default function LoginPage() {
    const { login } = useUser()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [demoLoading, setDemoLoading] = useState<string | null>(null)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            await login(email, password)
        } catch (err: any) {
            if (err.message === 'Failed to fetch' || err.message?.includes('NetworkError')) {
                setError('Cannot connect to server. Please try again later.')
            } else {
                setError(err.message || 'Failed to sign in. Please check your credentials.')
            }
            setIsLoading(false)
        }
    }

    const handleDemo = async (demoEmail: string, demoPassword: string, label: string) => {
        setError('')
        setDemoLoading(label)
        try {
            await login(demoEmail, demoPassword)
        } catch (err: any) {
            setError('Demo login failed — the database may still be seeding. Try again in a moment.')
            setDemoLoading(null)
        }
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: A.bg }}>
            {/* Left panel */}
            <div
                className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
                style={{ backgroundColor: A.panel, ...staffLines }}
            >
                {/* Subtle amber glow top-right */}
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
                        Welcome back.
                    </h1>
                    <p className="text-lg leading-relaxed" style={{ color: A.panelMuted }}>
                        Your gigs, bands, and bookings are waiting.
                    </p>
                    <div className="space-y-3 pt-2">
                        {[
                            'Gig marketplace — no middleman',
                            'Band availability & pay scales',
                            'Scheduling, billing, and messaging',
                        ].map((t) => (
                            <div key={t} className="flex items-center gap-3">
                                <div
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: A.amber }}
                                />
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
            <div className="flex-1 flex items-center justify-center p-6 md:p-10" style={{ backgroundColor: A.bg }}>
                <div className="w-full max-w-md">
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
                                Sign in
                            </h2>
                            <p className="text-sm" style={{ color: A.muted }}>
                                Don&apos;t have an account?{' '}
                                <Link
                                    href="/signup"
                                    className="font-semibold transition-colors"
                                    style={{ color: A.amber }}
                                    onMouseEnter={e => (e.currentTarget.style.color = A.amberDark)}
                                    onMouseLeave={e => (e.currentTarget.style.color = A.amber)}
                                >
                                    Sign up free
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm" style={{ backgroundColor: 'rgba(181,64,64,0.06)', border: '1px solid rgba(181,64,64,0.2)', color: '#b54040' }}>
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: A.muted }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4" style={{ color: A.faint }} />
                                    </div>
                                    <input
                                        id="email" name="email" type="email" autoComplete="email" required
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        className={inp}
                                        style={{ paddingLeft: '2.375rem', paddingRight: '0.875rem', backgroundColor: A.bg, borderColor: A.border, color: A.text }}
                                        onFocus={e => { e.currentTarget.style.borderColor = A.amber; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = `0 0 0 3px ${A.amberLight}` }}
                                        onBlur={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.backgroundColor = A.bg; e.currentTarget.style.boxShadow = 'none' }}
                                        placeholder="you@example.com"
                                    />
                                </div>
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
                                        id="password" name="password" type="password" autoComplete="current-password" required
                                        value={password} onChange={e => setPassword(e.target.value)}
                                        className={inp}
                                        style={{ paddingLeft: '2.375rem', paddingRight: '0.875rem', backgroundColor: A.bg, borderColor: A.border, color: A.text }}
                                        onFocus={e => { e.currentTarget.style.borderColor = A.amber; e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = `0 0 0 3px ${A.amberLight}` }}
                                        onBlur={e => { e.currentTarget.style.borderColor = A.border; e.currentTarget.style.backgroundColor = A.bg; e.currentTarget.style.boxShadow = 'none' }}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded" style={{ accentColor: A.amber }} />
                                    <span className="text-sm" style={{ color: A.muted }}>Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-semibold transition-colors"
                                    style={{ color: A.amber }}
                                    onMouseEnter={e => (e.currentTarget.style.color = A.amberDark)}
                                    onMouseLeave={e => (e.currentTarget.style.color = A.amber)}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit" disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: A.amber, color: '#fff' }}
                                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = A.amberDark }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = A.amber }}
                            >
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-xs" style={{ color: A.faint }}>
                            By signing in, you agree to our{' '}
                            <Link href="/terms" style={{ color: A.muted }} className="hover:underline">Terms</Link>
                            {' '}and{' '}
                            <Link href="/privacy" style={{ color: A.muted }} className="hover:underline">Privacy Policy</Link>
                        </p>
                    </div>

                    {/* Demo access */}
                    <div className="mt-5 rounded-2xl p-5" style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: A.muted }}>
                            Try the demo
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {DEMO_USERS.map(({ label, email: demoEmail, password: demoPassword }) => (
                                <button
                                    key={label}
                                    onClick={() => handleDemo(demoEmail, demoPassword, label)}
                                    disabled={demoLoading !== null || isLoading}
                                    className="flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                                    style={{ backgroundColor: A.amberLight, color: A.amber, border: `1px solid rgba(193,124,46,0.2)` }}
                                    onMouseEnter={e => { if (!demoLoading) { e.currentTarget.style.backgroundColor = 'rgba(193,124,46,0.2)' } }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = A.amberLight }}
                                >
                                    {demoLoading === label
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <ArrowRight className="w-3.5 h-3.5" />
                                    }
                                    {label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] mt-2.5" style={{ color: A.faint }}>
                            Resets every 24 h — feel free to explore.
                        </p>
                    </div>

                    <div className="mt-4 text-center">
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
