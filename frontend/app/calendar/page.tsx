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

// Floating orb component
function FloatingOrb({ delay = 0, duration = 20, size = 300, opacity = 0.15, color = 'earth-primary' }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl bg-${color}`}
            style={{
                width: size,
                height: size,
                opacity: opacity
            }}
            animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.1, 1]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
        />
    )
}

const features = [
    {
        icon: RefreshCw,
        title: 'Recurring Lessons',
        description: 'Set up weekly, bi-weekly, or monthly lessons that automatically populate your calendar',
        color: 'from-blue-500 to-cyan-500'
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
        color: 'from-violet-500 to-purple-500'
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

            <main className="min-h-screen bg-gradient-to-br from-earth-lighter via-neutral-light to-olive-light relative overflow-hidden">
                {/* Floating orbs background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <FloatingOrb delay={0} duration={25} size={500} opacity={0.1} color="earth-primary" />
                    <FloatingOrb delay={5} duration={20} size={400} opacity={0.08} color="olive-primary" />
                    <FloatingOrb delay={10} duration={30} size={600} opacity={0.06} color="earth-light" />
                </div>

                {/* Hero Section */}
                <section className="relative px-4 pt-32 pb-20">
                    <div className="max-w-6xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/20 text-sm font-medium text-earth-dark mb-6"
                        >
                            <Calendar className="w-4 h-4" />
                            Smart Scheduling for Music Studios
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold mb-6"
                        >
                            <span className="bg-gradient-to-r from-earth-primary via-olive-primary to-earth-dark bg-clip-text text-transparent">
                                Never Miss a Beat
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                        >
                            Intelligent scheduling that handles recurring lessons, prevents conflicts, and keeps everyone in sync.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                href="/signup"
                                className="px-8 py-4 bg-gradient-to-r from-earth-primary to-olive-dark text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-4 bg-white/60 backdrop-blur-md text-gray-900 rounded-2xl font-semibold border border-white/20 hover:bg-white/80 transition-all inline-flex items-center justify-center gap-2"
                            >
                                View Your Calendar
                                <Calendar className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="relative px-4 py-20">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Scheduling Made Simple
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Everything you need to manage your studio's schedule efficiently
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group relative rounded-3xl overflow-hidden"
                                >
                                    {/* Glassmorphic card */}
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl" />

                                    {/* Gradient overlay on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                                    {/* Content */}
                                    <div className="relative p-8">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                            <feature.icon className="w-7 h-7 text-white" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {feature.title}
                                        </h3>

                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Decorative element */}
                                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="relative px-4 py-20">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl overflow-hidden"
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-earth-primary via-olive-primary to-earth-light" />

                            {/* Decorative orbs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                            {/* Content */}
                            <div className="relative p-12">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                        Everything You Need in One Calendar
                                    </h2>
                                    <p className="text-white/90 text-lg max-w-2xl mx-auto">
                                        Powerful features that make scheduling lessons effortless
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                    {benefits.map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-white font-medium">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative px-4 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Sparkles className="w-16 h-16 mx-auto mb-6 text-earth-dark" />
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-earth-primary to-olive-dark bg-clip-text text-transparent">
                                Ready to Streamline Your Schedule?
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                Join hundreds of music studios using StudioSync to manage their calendars efficiently.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/signup"
                                    className="px-10 py-5 bg-gradient-to-r from-earth-primary to-olive-dark text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2 text-lg"
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="px-10 py-5 bg-white/60 backdrop-blur-md text-gray-900 rounded-2xl font-semibold border border-white/20 hover:bg-white/80 transition-all inline-flex items-center justify-center text-lg"
                                >
                                    View Pricing
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500 mt-6">
                                No credit card required • 30-day free trial • Cancel anytime
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}
