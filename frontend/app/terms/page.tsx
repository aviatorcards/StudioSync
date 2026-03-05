'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { FileText, Scale, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react'

export default function TermsPage() {
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
                                <Scale className="w-3.5 h-3.5" />
                                Legal Agreement
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                                Terms of{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Service
                                </span>
                            </h1>

                            <p className="text-gray-500 font-medium">
                                Last updated: March 4, 2026
                            </p>
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
                                {/* Important Note */}
                                <div className="flex gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-amber-900 text-sm leading-relaxed">
                                        <strong>Please read carefully:</strong> By using StudioSync, you agree to these terms. They cover your rights, our obligations, and how we handle disputes.
                                    </p>
                                </div>

                                {/* Section 1 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        By accessing or using StudioSync, you agree to be bound by these Terms of Service.
                                        If you do not agree to these terms, please do not use our services.
                                    </p>
                                </section>

                                {/* Section 2 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Description of Service</h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        StudioSync provides studio management software for music teachers and schools.
                                        Our service includes:
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                                        {[
                                            'Student and lesson management',
                                            'Scheduling and calendar tools',
                                            'Billing and invoicing features',
                                            'Communication and messaging'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <ShieldCheck className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Section 3 */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                                        <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
                                    </div>
                                    <div className="space-y-4 text-gray-600 leading-relaxed">
                                        <p>You are responsible for:</p>
                                        <ul className="space-y-2 list-none">
                                            {[
                                                'Maintaining the confidentiality of your account credentials',
                                                'All activities that occur under your account',
                                                'Promptly notifying us of any unauthorized use'
                                            ].map((li, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0" />
                                                    {li}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </section>

                                {/* Section 6 - Contact */}
                                <section className="space-y-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">6</div>
                                        <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        For any questions regarding these terms, please contact our legal team:
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <a
                                            href="mailto:tristan@fddl.dev"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                                        >
                                            <FileText className="w-4 h-4" />
                                            tristan@fddl.dev
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
