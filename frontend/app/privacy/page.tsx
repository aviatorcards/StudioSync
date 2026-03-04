'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Shield, Lock, Eye, FileText, Check, ArrowRight } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-gray-50">
                {/* Header */}
                <section className="relative overflow-hidden bg-white border-b border-gray-100 py-20 md:py-28">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />
                    
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                                <Shield className="w-3.5 h-3.5" />
                                Your Privacy Matters
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                                Privacy{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Policy
                                </span>
                            </h1>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-gray-500 font-medium">
                                    Last updated: March 4, 2026
                                </p>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        <Check className="w-3 h-3" />
                                        GDPR Compliant
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                        <Check className="w-3 h-3" />
                                        FERPA Compliant
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-8 md:p-12 space-y-12">
                                {/* Quick Intro */}
                                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50">
                                    <p className="text-indigo-900 text-sm leading-relaxed font-medium">
                                        <strong>Quick Summary:</strong> We respect your privacy and process data solely to run your studio effectively. We do NOT sell your data. You have the right to access, export, or delete your information at any time.
                                    </p>
                                </div>

                                {/* Section 1 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        StudioSync (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal data.
                                        This Privacy Policy explains how we collect, use, store, and protect your information in compliance with
                                        the General Data Protection Regulation (GDPR) and the Family Educational Rights and Privacy Act (FERPA).
                                    </p>
                                </section>

                                {/* Section 2 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Data Controller</h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        StudioSync LLC acts as the data controller for personal information processed through our platform.
                                    </p>
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">Privacy Officer</h3>
                                                <p className="text-sm text-gray-500 mb-2 underline decoration-indigo-200 underline-offset-4">privacy@studiosync.app</p>
                                                <p className="text-xs text-gray-400 leading-tight">123 Studio Lane, Nashville, TN 37203</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { title: 'Account Info', desc: 'Name, email, encrypted password, and profile settings.' },
                                            { title: 'Educational Records', desc: 'Lesson notes, progress tracking, and student assessments.' },
                                            { title: 'Billing Data', desc: 'Invoices and billing addresses. Payments processed via Stripe.' },
                                            { title: 'Usage Data', desc: 'IP address, browser type, and platform interactions.' }
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Section 11 - Rights */}
                                <section className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">11</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Your Rights (GDPR)</h2>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {[
                                            { icon: Eye, title: 'Access', desc: 'View all data we hold.' },
                                            { icon: FileText, title: 'Portability', desc: 'Export your data to JSON.' },
                                            { icon: Lock, title: 'Erasure', desc: 'Delete your account.' },
                                            { icon: Check, title: 'Rectification', desc: 'Correct inaccurate data.' }
                                        ].map((item, i) => (
                                            <Link 
                                                key={i} 
                                                href="/dashboard/settings"
                                                className="group flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-200 transition-all hover:bg-white hover:shadow-md"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    <item.icon className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>

                                {/* CTA */}
                                <div className="pt-10 border-t border-gray-100">
                                    <div className="bg-gray-900 rounded-3xl p-8 text-center text-white relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />
                                        <div className="relative">
                                            <h3 className="text-xl font-bold mb-4">Have questions about your data?</h3>
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                                <a 
                                                    href="mailto:privacy@studiosync.app"
                                                    className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                                                >
                                                    Contact Privacy Team
                                                    <ArrowRight className="w-4 h-4" />
                                                </a>
                                                <Link
                                                    href="/support"
                                                    className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Visit Help Center
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
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
