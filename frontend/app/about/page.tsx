'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Music, Heart, Zap, Users, Target, Code, Sparkles, ArrowRight, Github, Check } from 'lucide-react'

function ValueCard({ value, index }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-80px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-md hover:border-gray-200 transition-all text-center group"
        >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform`}>
                <value.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm">{value.description}</p>
        </motion.div>
    )
}

function TimelineItem({ item, index }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all"
        >
            <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            {item.year}
                        </span>
                    </div>
                    <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
                </div>
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
            color: 'from-indigo-500 to-indigo-600'
        },
        {
            icon: Zap,
            title: 'Simplicity',
            description: 'Powerful doesn\'t have to mean complicated. We believe in intuitive design that just works.',
            color: 'from-emerald-500 to-teal-500'
        },
        {
            icon: Users,
            title: 'Community',
            description: 'We\'re building more than software—we\'re building a community of passionate music educators.',
            color: 'from-purple-500 to-indigo-500'
        }
    ]

    const timeline = [
        {
            title: 'The Problem',
            year: '2023',
            icon: Target,
            color: 'from-red-500 to-pink-500',
            description: 'Managing a growing music studio with spreadsheets and multiple apps became unsustainable. Hours lost to admin work instead of teaching.'
        },
        {
            title: 'The Search',
            year: '2023',
            icon: Music,
            color: 'from-amber-500 to-orange-500',
            description: 'Existing solutions were either too complex or cost $3,000+ annually. Independent instructors needed something better.'
        },
        {
            title: 'The Solution',
            year: '2024',
            icon: Code,
            color: 'from-indigo-500 to-indigo-600',
            description: 'Built StudioSync as an all-in-one platform: scheduling, billing, student management, and communication in one beautiful interface.'
        },
        {
            title: 'Open Source',
            year: '2024',
            icon: Github,
            color: 'from-gray-700 to-gray-900',
            description: 'Made it open source and affordable for all. Because every instructor deserves professional tools without breaking the bank.'
        }
    ]

    return (
        <>
            <Navigation />

            <main className="bg-gray-50">
                {/* Hero Section */}
                <section className="bg-white border-b border-gray-100 px-4 py-20 md:py-28">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                                <Sparkles className="w-3.5 h-3.5" />
                                Our Story
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                                Built by teachers,{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    for teachers
                                </span>
                            </h1>

                            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                                Empowering music instructors with tools that make studio management effortless,
                                so you can focus on what you love—teaching music.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="px-4 py-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Music className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                                </div>
                                <div className="space-y-4 text-gray-500 leading-relaxed">
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
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                Our Values
                            </h2>
                            <p className="text-lg text-gray-500">
                                The principles that guide everything we build
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-5">
                            {values.map((value, index) => (
                                <ValueCard key={index} value={value} index={index} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                The Journey
                            </h2>
                            <p className="text-lg text-gray-500">
                                From frustration to solution
                            </p>
                        </motion.div>

                        <div className="space-y-4">
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
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-900 rounded-2xl overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-purple-600/15" />

                            <div className="relative p-8 md:p-10 text-white">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                        <Github className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Open Source & Free</h2>
                                </div>
                                <div className="space-y-3 text-gray-300 leading-relaxed mb-6">
                                    <p>
                                        StudioSync is proudly open source. We believe in transparency, community collaboration, and giving
                                        instructors the freedom to customize and self-host their own solution.
                                    </p>
                                    <p>
                                        The code is available on GitHub, and contributions are always welcome. Because the best software
                                        is built by the people who actually use it.
                                    </p>
                                </div>
                                <a
                                    href="https://github.com/aviatorcards/StudioSync"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm"
                                >
                                    <Github className="w-4 h-4" />
                                    View on GitHub
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <p className="text-xs text-gray-500 mt-3">
                                    Self-hosting instructions and deployment guides available in the repository
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="px-8 py-14 md:p-14 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                                    Ready to transform your studio?
                                </h2>
                                <p className="text-lg mb-8 text-gray-500 max-w-2xl mx-auto">
                                    Try StudioSync and see how it can streamline your studio operations.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    <Link
                                        href="/pricing"
                                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        View Pricing
                                    </Link>
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
