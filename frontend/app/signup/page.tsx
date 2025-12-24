'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'

export default function SignupPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'student',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState('starter')

    // Get plan from URL params
    useEffect(() => {
        const plan = searchParams.get('plan')
        if (plan) {
            setSelectedPlan(plan)
        }
    }, [searchParams])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Required for CORS with credentials
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    role: formData.role,
                }),
            })

            if (response.ok) {
                // Redirect to login with success message
                router.push('/login?registered=true')
            } else {
                const data = await response.json()
                setError(data.detail || data.email?.[0] || 'Registration failed')
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
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
                        Start managing your studio today
                    </h1>
                    <p className="text-xl text-white/90">
                        Join hundreds of music instructors who trust StudioSync to run their studios.
                    </p>

                    {/* Features */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white/90">Free forever for up to 10 students</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white/90">No credit card required</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white/90">Set up in under 5 minutes</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-white/60 text-sm">
                    © 2025 StudioSync. Open source and self-hostable.
                </div>
            </div>

            {/* Right Side - Signup Form */}
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

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                                Create your account
                            </h2>
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Selected Plan Badge */}
                        {selectedPlan && selectedPlan !== 'starter' && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
                                <p className="text-sm font-semibold text-gray-700">
                                    Selected Plan: <span className="text-primary capitalize">{selectedPlan}</span>
                                </p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

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
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                    I am a
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Instructor</option>
                                    <option value="parent">Parent</option>
                                    <option value="staff">Studio Staff</option>
                                </select>
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
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">At least 8 characters</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            By signing up, you agree to our{' '}
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
