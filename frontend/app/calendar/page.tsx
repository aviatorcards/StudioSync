'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import {
    Calendar,
    Clock,
    Bell,
    Users,
    RefreshCw,
    Smartphone,
    Check,
    Sparkles,
    ArrowRight,
    Zap
} from 'lucide-react'

const features = [
    {
        icon: RefreshCw,
        title: 'Recurring Lessons',
        description: 'Set up weekly, bi-weekly, or monthly lessons that automatically populate your calendar',
        color: 'from-indigo-500 to-indigo-600'
    },
    {
        icon: Bell,
        title: 'Smart Reminders',
        description: 'Automatic email and SMS notifications for upcoming lessons reduce no-shows',
        color: 'from-purple-500 to-indigo-500'
    },
    {
        icon: Users,
        title: 'Multi-Instructor',
        description: 'Manage schedules for multiple teachers, rooms, and instruments in one place',
        color: 'from-emerald-500 to-teal-500'
    },
    {
        icon: Clock,
        title: 'Conflict Detection',
        description: 'Never double-book a time slot with automatic conflict detection',
        color: 'from-amber-500 to-orange-500'
    },
    {
        icon: Smartphone,
        title: 'Calendar Sync',
        description: 'Integrate with Google Calendar, iCal, and other calendar apps',
        color: 'from-pink-500 to-rose-500'
    },
    {
        icon: Zap,
        title: 'Quick Rescheduling',
        description: 'Drag and drop to reschedule, with automatic student notifications',
        color: 'from-cyan-500 to-blue-500'
    }
]

const benefits = [
    'Visual week and month views',
    'Color-coded by student or instrument',
    'Online and in-person lesson tracking',
    'Makeup lesson management',
    'Cancellation tracking with reasons',
    'Time zone support'
]

export default function CalendarPage() {
    return (
        <>
            <Navigation />

            <main className="bg-gray-50">
                {/* Hero Section */}
                <section className="bg-white border-b border-gray-100 px-4 pt-20 pb-20 md:pt-28 md:pb-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                                <Calendar className="w-3.5 h-3.5" />
                                Smart Scheduling
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                                Never miss{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    a beat
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                                Intelligent scheduling that handles recurring lessons, prevents conflicts, and keeps everyone in sync.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/signup"
                                    className="px-7 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-7 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    View Your Calendar
                                    <Calendar className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="px-4 py-20 md:py-28">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-14"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                Scheduling made simple
                            </h2>
                            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                                Everything you need to manage your studio's schedule efficiently
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.08 }}
                                    className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 rounded-2xl overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-purple-600/15" />

                            <div className="relative p-8 md:p-10">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                        Everything you need in one calendar
                                    </h2>
                                    <p className="text-gray-400 max-w-xl mx-auto">
                                        Powerful features that make scheduling lessons effortless
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                                    {benefits.map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.08 }}
                                            className="flex items-center gap-3 bg-white/5 rounded-xl p-3.5 border border-white/10"
                                        >
                                            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="text-white text-sm font-medium">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Sparkles className="w-12 h-12 mx-auto mb-5 text-indigo-500" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                Ready to streamline your schedule?
                            </h2>
                            <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
                                Try StudioSync and manage your studio calendar efficiently.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/signup"
                                    className="px-7 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="px-7 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
                                >
                                    View Pricing
                                </Link>
                            </div>
                            <p className="text-sm text-gray-400 mt-5">
                                No credit card required · 30-day free trial · Cancel anytime
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}
