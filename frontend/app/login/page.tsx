'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

export default function LoginPage() {
    const { login } = useUser()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
        } catch (err: any) {
            console.error('Login error:', err)
            if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
                setError('Cannot connect to server. Please try again later.')
            } else {
                setError(err.message || 'Failed to sign in. Please check your credentials.')
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
                {/* Subtle gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-purple-600/15" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <Logo className="w-10 h-10" />
                        <span className="text-2xl font-bold text-white">StudioSync</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Welcome back to your studio
                    </h1>
                    <p className="text-lg text-gray-300">
                        Manage your music lessons, students, and schedule all in one place.
                    </p>
                </div>

                <div className="relative z-10 text-gray-500 text-sm">
                    © 2025 StudioSync. Open source and self-hostable.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8 group">
                        <Logo className="w-10 h-10" />
                        <span className="text-xl font-bold text-gray-900">StudioSync</span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Sign in
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Sign up free
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500">
                                        Remember me
                                    </label>
                                </div>

                                <Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 text-center text-xs text-gray-400">
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="text-gray-500 hover:underline">
                                Terms
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-gray-500 hover:underline">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
