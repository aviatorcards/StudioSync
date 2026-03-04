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
            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all text-center group"
        >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                <value.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm font-medium">{value.description}</p>
        </motion.div>
    )
}

function TimelineItem({ item, index }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <div className="mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
                    </div>
                    <p className="text-gray-500 leading-relaxed font-medium">{item.description}</p>
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
            title: 'The Challenge',
            icon: Target,
            color: 'from-red-500 to-pink-500',
            description: 'Managing a growing music studio with manual spreadsheets and disconnected apps was unsustainable. Teachers were losing hours to administration instead of doing what they love: teaching.'
        },
        {
            title: 'The Discovery',
            icon: Music,
            color: 'from-amber-500 to-orange-500',
            description: 'Existing tools were often overly complex, outdated, or prohibitively expensive for independent instructors. We knew there had to be a better way to support the music education community.'
        },
        {
            title: 'The Innovation',
            icon: Code,
            color: 'from-indigo-500 to-indigo-600',
            description: 'We built StudioSync to unify everything. Scheduling, billing, and communication now live in a single, elegant interface designed to flow with the rhythm of a music studio.'
        },
        {
            title: 'Open For All',
            icon: Github,
            color: 'from-gray-700 to-gray-900',
            description: 'We chose to make StudioSync open source to ensure professional-grade tools are accessible to every instructor, regardless of studio size. No gatekeeping, just pure empowerment.'
        }
    ]

    return (
        <>
            <Navigation />

            <main className="min-h-screen bg-gray-50 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-white via-indigo-50/30 to-transparent pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[60%] left-[-10%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none" />

                {/* Hero Section */}
                <section className="relative px-4 py-24 md:py-32 overflow-hidden">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-8">
                                <Sparkles className="w-4 h-4" />
                                Our Story
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-900 tracking-tight">
                                Built by teachers,{' '}
                                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                                    for teachers
                                </span>
                            </h1>

                            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                                Empowering music instructors with tools that make studio management effortless,
                                so you can focus on what you love—teaching music.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <div className="relative z-10">
                    {/* Mission Section */}
                    <section className="px-4 pb-24">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 overflow-hidden group"
                            >
                                <div className="p-10 md:p-14 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                                            <Music className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                                    </div>
                                    <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-medium">
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
                    <section className="px-4 pb-24">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900 tracking-tight">
                                    Our Values
                                </h2>
                                <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                                    The principles that guide every pixel and line of code we write.
                                </p>
                            </motion.div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {values.map((value, index) => (
                                    <ValueCard key={index} value={value} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Timeline Section */}
                    <section className="px-4 pb-24">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900 tracking-tight">
                                    The Evolution
                                </h2>
                                <p className="text-xl text-gray-500 font-medium">
                                    How we went from solving a personal challenge to empowering music educators everywhere.
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
                    <section className="px-4 pb-24">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gray-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-indigo-900/20 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20" />
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                <div className="relative p-12 md:p-16 text-white text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-xl">
                                            <Github className="w-8 h-8" />
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Open Source & Free</h2>
                                    </div>
                                    <div className="space-y-6 text-gray-300 text-lg leading-relaxed mb-10 font-medium max-w-3xl">
                                        <p>
                                            StudioSync is proudly open source. We believe in transparency, community collaboration, and giving
                                            instructors the freedom to customize and self-host their own solution.
                                        </p>
                                        <p>
                                            The code is available on GitHub, and contributions are always welcome. Because the best software
                                            is built by the people who actually use it every single day.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <a
                                            href="https://github.com/aviatorcards/StudioSync"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-8 py-4 bg-white text-gray-900 rounded-2xl hover:bg-gray-100 transition-all font-bold flex items-center gap-3 shadow-lg active:scale-95"
                                        >
                                            <Github className="w-5 h-5" />
                                            View on GitHub
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </a>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Self-hosting guides available inside
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="px-4 pb-32">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/20"
                            >
                                <div className="px-10 py-16 md:p-20 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight relative z-10">
                                        Join the movement.
                                    </h2>
                                    <p className="text-xl mb-10 text-indigo-100 max-w-2xl mx-auto font-medium relative z-10">
                                        Experience the all-in-one platform built specifically for the modern music educator.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                        <Link
                                            href="/signup"
                                            className="px-10 py-4 bg-white text-indigo-600 rounded-[1.5rem] font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95"
                                        >
                                            Get Started Now
                                        </Link>

                                        <Link
                                            href="/pricing"
                                            className="px-10 py-4 bg-indigo-500/20 border border-white/20 text-white rounded-[1.5rem] font-bold backdrop-blur-sm hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            View Pricing
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    )
}
