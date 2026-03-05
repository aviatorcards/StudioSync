'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react'
import Image from 'next/image'
import { Logo } from '@/components/Logo'

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
            const response = await fetch('/api/auth/register/', {
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
                setError(data.error || data.detail || data.email?.[0] || 'Registration failed')
            }

        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
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
                        Start managing your studio today
                    </h1>
                    <p className="text-lg text-gray-300">
                        Music instructors trust StudioSync to run their studios.
                    </p>

                    {/* Features */}
                    <div className="space-y-3 pt-2">
                        {[
                            'Free forever for up to 10 students',
                            'No credit card required',
                            'Set up in under 5 minutes'
                        ].map((text) => (
                            <div key={text} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-gray-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-gray-500 text-sm">
                    © 2025 StudioSync. Open source and self-hostable.
                </div>
            </div>

            {/* Right Side - Signup Form */}
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
                                Create your account
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Selected Plan Badge */}
                        {selectedPlan && selectedPlan !== 'starter' && (
                            <div className="mb-5 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <p className="text-sm font-semibold text-gray-700">
                                    Selected Plan: <span className="text-indigo-600 capitalize">{selectedPlan}</span>
                                </p>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="firstName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

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
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    I am a
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Instructor</option>
                                    <option value="parent">Parent</option>
                                    <option value="staff">Studio Staff</option>
                                </select>
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
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">At least 8 characters</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 text-center text-xs text-gray-400">
                            By signing up, you agree to our{' '}
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
