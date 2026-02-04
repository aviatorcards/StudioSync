'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Music, Heart, Zap, Users, Target, Code, Sparkles, ArrowRight, Github } from 'lucide-react'
import { RippleCard } from '@/components/RippleCard'

// Optimized FloatingOrb using CSS animations instead of Framer Motion
function FloatingOrb({
    size = 300,
    opacity = 0.15,
    color = 'earth-primary',
    variant = 'default',
    className = ''
}: {
    size?: number
    opacity?: number
    color?: string
    variant?: 'default' | 'alt'
    className?: string
}) {
    return (
        <div
            className={`absolute rounded-full blur-xl bg-${color} ${variant === 'alt' ? 'animate-float-orb-alt' : 'animate-float-orb'} ${className}`}
            style={{
                width: size,
                height: size,
                opacity: opacity,
            }}
        />
    )
}

function ValueCard({ value, index }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <RippleCard className="relative group h-full cursor-pointer rounded-3xl overflow-hidden">
                {/* Glassmorphic background - optimized */}
                <div className="absolute inset-0 bg-white/75 border border-white/30" />

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative p-8 text-center">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    >
                        <value.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>

                {/* Decorative element */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${value.color} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
            </RippleCard>
        </motion.div>
    )
}

function TimelineItem({ item, index }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="relative"
        >
            <div className="relative rounded-2xl overflow-hidden">
                {/* Glass background - optimized */}
                <div className="absolute inset-0 bg-white/80 border border-white/30" />

                {/* Content */}
                <div className="relative p-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                            <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                <span className="text-xs px-2 py-1 rounded-full bg-earth-lighter text-earth-dark font-medium">
                                    {item.year}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function StatCard({ stat, index }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative rounded-2xl overflow-hidden text-center p-8"
        >
            <div className="absolute inset-0 bg-white/80 border border-white/30" />
            <div className="relative">
                <div className="text-5xl font-bold bg-gradient-to-r from-earth-primary to-olive-dark bg-clip-text text-transparent mb-2">
                    {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
        </motion.div>
    )
}

export default function AboutPage() {
    const values = [
        {
            icon: Heart,
            title: 'Instructor First',
            description: 'Every feature we build starts with the question: "Does this make an instructor\'s life easier?"',
            color: 'from-earth-primary to-earth-dark'
        },
        {
            icon: Zap,
            title: 'Simplicity',
            description: 'Powerful doesn\'t have to mean complicated. We believe in intuitive design that just works.',
            color: 'from-olive-primary to-olive-dark'
        },
        {
            icon: Users,
            title: 'Community',
            description: 'We\'re building more than software—we\'re building a community of passionate music educators.',
            color: 'from-earth-light to-earth-primary'
        }
    ]

    const timeline = [
        {
            title: 'The Problem',
            year: '2023',
            icon: Target,
            color: 'from-earth-primary to-earth-dark',
            description: 'Managing a growing music studio with spreadsheets and multiple apps became unsustainable. Hours lost to admin work instead of teaching.'
        },
        {
            title: 'The Search',
            year: '2023',
            icon: Music,
            color: 'from-olive-light to-olive-primary',
            description: 'Existing solutions were either too complex or cost $3,000+ annually. Independent instructors needed something better.'
        },
        {
            title: 'The Solution',
            year: '2024',
            icon: Code,
            color: 'from-earth-light to-earth-primary',
            description: 'Built StudioSync as an all-in-one platform: scheduling, billing, student management, and communication in one beautiful interface.'
        },
        {
            title: 'Open Source',
            year: '2024',
            icon: Github,
            color: 'from-olive-primary to-olive-dark',
            description: 'Made it open source and affordable for all. Because every instructor deserves professional tools without breaking the bank.'
        }
    ]

    const stats = [
        { value: '500+', label: 'Music Studios' },
        { value: '50K+', label: 'Students Managed' },
        { value: '99.9%', label: 'Uptime' },
        { value: 'Open', label: 'Source' }
    ]

    return (
        <>
            <Navigation />

            {/* Animated background - optimized with CSS animations */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-earth-lighter via-neutral-light to-olive-light">
                <FloatingOrb size={400} opacity={0.12} color="earth-primary" className="top-[10%] left-[10%]" />
                <FloatingOrb size={300} opacity={0.1} color="olive-primary" variant="alt" className="top-[40%] right-[15%]" />
                <FloatingOrb size={350} opacity={0.08} color="earth-light" className="bottom-[20%] left-[20%]" />

                {/* Musical staff lines */}
                <div className="absolute inset-0 opacity-5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-0 right-0 h-px bg-gray-900"
                            style={{ top: `${20 + i * 15}%` }}
                        />
                    ))}
                </div>
            </div>

            <main className="relative">
                {/* Hero Section */}
                <section className="px-4 py-20 md:py-28">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-earth-light text-earth-dark font-medium mb-8"
                            >
                                <Sparkles className="w-4 h-4" />
                                Our Story
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                <span className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Built by Teachers,
                                </span>
                                <span className="block bg-gradient-to-r from-earth-primary to-olive-dark bg-clip-text text-transparent">
                                    For Teachers
                                </span>
                            </h1>

                            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                                Empowering music instructors with tools that make studio management effortless,
                                so you can focus on what you love—teaching music.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard key={index} stat={stat} index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl overflow-hidden"
                        >
                            {/* Glass background - optimized */}
                            <div className="absolute inset-0 bg-white/80 border border-white/30" />

                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-earth-primary via-olive-primary to-earth-light" />

                            {/* Content */}
                            <div className="relative p-8 md:p-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-earth-primary to-olive-dark flex items-center justify-center">
                                        <Music className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        Our Mission
                                    </h2>
                                </div>
                                <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                                    <p>
                                        StudioSync was built with a simple mission: to give music instructors and studio owners back their time
                                        so they can focus on what they love most—teaching music.
                                    </p>
                                    <p>
                                        We believe that managing a music studio shouldn't require juggling spreadsheets, multiple apps, and
                                        endless paperwork. That's why we created an all-in-one platform that handles scheduling, billing,
                                        student management, and communication in one beautiful, intuitive interface.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Our Values
                            </h2>
                            <p className="text-xl text-gray-600">
                                The principles that guide everything we build
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {values.map((value, index) => (
                                <ValueCard key={index} value={value} index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline/Story Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                The Journey
                            </h2>
                            <p className="text-xl text-gray-600">
                                From frustration to solution
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            {timeline.map((item, index) => (
                                <TimelineItem key={index} item={item} index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Source Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative rounded-3xl overflow-hidden"
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-earth-primary/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-olive-primary/20 rounded-full blur-3xl" />

                            {/* Content */}
                            <div className="relative p-8 md:p-12 text-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                                        <Github className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-4xl font-bold">Open Source & Free</h2>
                                </div>
                                <div className="space-y-4 text-white/90 leading-relaxed mb-8">
                                    <p className="text-lg">
                                        StudioSync is proudly open source. We believe in transparency, community collaboration, and giving
                                        instructors the freedom to customize and self-host their own solution.
                                    </p>
                                    <p className="text-lg">
                                        The code is available on GitHub, and contributions are always welcome. Because the best software
                                        is built by the people who actually use it.
                                    </p>
                                </div>
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href="https://github.com/fddl-dev/studiosync"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                                >
                                    <Github className="w-5 h-5" />
                                    View on GitHub
                                    <ArrowRight className="w-5 h-5" />
                                </motion.a>
                                <p className="text-sm text-white/60 mt-4">
                                    Self-hosting instructions and deployment guides available in the repository
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 pb-32">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative rounded-3xl overflow-hidden"
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-earth-primary via-olive-primary to-earth-light" />

                            {/* Animated orbs */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                            {/* Content */}
                            <div className="relative px-8 py-16 md:p-16 text-center text-white">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                    Ready to Transform Your Studio?
                                </h2>
                                <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                                    Join hundreds of music instructors who are already using StudioSync to streamline their studios.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href="/signup"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-earth-dark rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                                        >
                                            Start Free Trial
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href="/pricing"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/25 transition-all"
                                        >
                                            View Pricing
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}
