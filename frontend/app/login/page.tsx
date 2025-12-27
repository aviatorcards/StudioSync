'use client'

import { useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
                setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8000')
            } else {
                setError(err.message || 'Failed to sign in. Please check your credentials.')
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform overflow-hidden">
                            <Image src="/logo_final.png" alt="StudioSync" width={40} height={40} className="object-contain" />
                        </div>
                        <span className="text-3xl font-bold text-white">StudioSync</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-5xl font-bold text-white leading-tight">
                        Welcome back to your studio
                    </h1>
                    <p className="text-xl text-white/90">
                        Manage your music lessons, students, and schedule all in one beautiful place.
                    </p>
                    <div className="flex gap-8 pt-4">
                        <div>
                            <div className="text-3xl font-bold text-white">0</div>
                            <div className="text-white/80">Lessons scheduled</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">1</div>
                            <div className="text-white/80">Music instructor(s)</div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-white/60 text-sm">
                    © 2025 StudioSync. Open source and self-hostable.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-3 justify-center mb-8 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
                            <Image src="/logo_final.png" alt="StudioSync" width={32} height={32} className="object-contain" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            StudioSync
                        </span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 ring-1 ring-black/5 antialiased">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                                Sign in
                            </h2>
                            <p className="text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Sign up free
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>



                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant="gradient"
                                className="w-full h-12"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="text-primary hover:underline">
                                Terms
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
