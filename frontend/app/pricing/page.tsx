'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Check,
    Sparkles,
    Zap,
    Shield,
    Users,
    TrendingUp,
    Award,
    ArrowRight,
    X,
    Code
} from 'lucide-react'

function FloatingOrb({ delay = 0, duration = 20, size = 300, opacity = 0.15, color = 'purple' }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl bg-${color}-500`}
            style={{
                width: size,
                height: size,
                opacity: opacity,
            }}
            animate={{
                x: [0, 100, 0, -100, 0],
                y: [0, -100, 0, 100, 0],
                scale: [1, 1.2, 1, 0.8, 1],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
            }}
        />
    )
}

function PricingCard({ plan, index, onSelect }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative ${plan.featured ? 'md:scale-105' : ''}`}
        >
            {/* Featured Badge */}
            {plan.featured && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                    </motion.div>
                </div>
            )}

            {/* Glassmorphic Card */}
            <div className={`relative rounded-3xl overflow-hidden ${plan.featured ? 'border-2 border-primary shadow-2xl shadow-purple-500/20' : ''}`}>
                {/* Glass Background */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl" />

                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                {/* Content */}
                <div className="relative p-8">
                    {/* Plan Header */}
                    <div className="mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 transform hover:scale-110 transition-transform`}>
                            <plan.icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-gray-600">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6">
                        {plan.price === 'Custom' ? (
                            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Custom
                            </div>
                        ) : plan.price === 'Free' ? (
                            <div className="text-4xl font-bold text-gray-900">Free</div>
                        ) : (
                            <div className="flex items-baseline">
                                <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    ${plan.price}
                                </span>
                                <span className="text-gray-600 ml-2">/month</span>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                        {plan.features.map((feature: any, idx: number) => (
                            <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                transition={{ delay: 0.3 + idx * 0.05 }}
                                className="flex items-start gap-3"
                            >
                                {feature.included ? (
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <X className="w-3 h-3 text-gray-400" />
                                    </div>
                                )}
                                <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                                    {feature.text}
                                </span>
                            </motion.li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(plan.id)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.featured
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                    >
                        {plan.cta}
                    </motion.button>

                    {plan.featured && (
                        <p className="text-xs text-center text-gray-500 mt-3">
                            14-day free trial • No credit card required
                        </p>
                    )}
                </div>

                {/* Decorative element */}
                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${plan.color} rounded-full opacity-10 blur-2xl`} />
            </div>
        </motion.div>
    )
}

function FeatureComparison() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const features = [
        { name: 'Students', starter: 'Up to 10', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Calendar & Scheduling', starter: true, pro: true, enterprise: true },
        { name: 'Email Notifications', starter: true, pro: true, enterprise: true },
        { name: 'SMS Notifications', starter: false, pro: true, enterprise: true },
        { name: 'Billing & Invoicing', starter: false, pro: true, enterprise: true },
        { name: 'Lesson Notes & Progress', starter: false, pro: true, enterprise: true },
        { name: 'Resource Library', starter: false, pro: true, enterprise: true },
        { name: 'Inventory Management', starter: false, pro: true, enterprise: true },
        { name: 'Custom Branding', starter: false, pro: true, enterprise: true },
        { name: 'Custom Domain', starter: false, pro: true, enterprise: true },
        { name: 'Multiple Locations', starter: false, pro: false, enterprise: true },
        { name: 'White-Label', starter: false, pro: false, enterprise: true },
        { name: 'API Access', starter: false, pro: false, enterprise: true },
        { name: 'Dedicated Support', starter: false, pro: false, enterprise: true },
    ]

    // Helper to render cell content
    const renderCell = (value: string | boolean, isPro: boolean = false) => {
        if (typeof value === 'boolean') {
            return value ? (
                <Check className={`w-5 h-5 ${isPro ? 'text-purple-600' : 'text-green-500'} mx-auto`} />
            ) : (
                <div className="w-5 h-5 mx-auto text-gray-300 text-center">-</div>
            )
        }
        return <span className={isPro ? 'font-bold text-gray-900' : 'text-gray-600 font-medium'}>{value}</span>
    }

    return (
        <div ref={ref} className="space-y-8">
            {/* Desktop Table View */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6 }}
                className="hidden md:block rounded-2xl overflow-hidden shadow-xl"
            >
                <div className="relative">
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/20 pointer-events-none" />

                    <table className="relative w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-6 font-semibold text-gray-900 w-1/4">Features</th>
                                <th className="text-center p-6 font-semibold text-gray-900 w-1/4">Starter</th>
                                <th className="text-center p-6 font-semibold bg-purple-50/50 w-1/4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-purple-600">Professional</span>
                                        <span className="text-[10px] uppercase tracking-wider text-purple-500 font-bold bg-purple-100 px-2 py-0.5 rounded-full mt-1">
                                            Recommended
                                        </span>
                                    </div>
                                </th>
                                <th className="text-center p-6 font-semibold text-gray-900 w-1/4">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b border-gray-100/50 hover:bg-white/40 transition-colors"
                                >
                                    <td className="p-4 text-gray-900 font-medium pl-6">{feature.name}</td>
                                    <td className="p-4 text-center">{renderCell(feature.starter)}</td>
                                    <td className="p-4 text-center bg-purple-50/30">{renderCell(feature.pro, true)}</td>
                                    <td className="p-4 text-center">{renderCell(feature.enterprise)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-4">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="relative bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-5 shadow-sm overflow-hidden"
                    >
                        <h3 className="text-gray-900 font-bold text-lg mb-4 text-center">{feature.name}</h3>

                        <div className="grid grid-cols-3 gap-2">
                            {/* Starter */}
                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50/80">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Starter</span>
                                {renderCell(feature.starter)}
                            </div>

                            {/* Professional */}
                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-purple-50 border border-purple-100 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-50" />
                                <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold mb-2">Pro</span>
                                {renderCell(feature.pro, true)}
                            </div>

                            {/* Enterprise */}
                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50/80">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Enterprise</span>
                                {renderCell(feature.enterprise)}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

function FAQItem({ question, answer, index }: any) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-xl overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/20" />
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-white/20 transition-colors"
                >
                    <h3 className="font-semibold text-gray-900 pr-8">{question}</h3>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </button>
                <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <p className="px-6 pb-6 text-gray-600 leading-relaxed">{answer}</p>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default function PricingPage() {
    const router = useRouter()

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Perfect for individual teachers',
            price: 'Free',
            color: 'from-blue-500 to-cyan-500',
            icon: Zap,
            cta: 'Get Started',
            featured: false,
            features: [
                { text: 'Up to 10 students', included: true },
                { text: 'Basic scheduling', included: true },
                { text: 'Calendar integration', included: true },
                { text: 'Email notifications', included: true },
                { text: 'SMS notifications', included: false },
                { text: 'Custom branding', included: false },
                { text: 'Custom domain', included: false },
            ]
        },
        {
            id: 'professional',
            name: 'Professional',
            description: 'For growing studios',
            price: '29',
            color: 'from-purple-500 to-indigo-500',
            icon: TrendingUp,
            cta: 'Start Free Trial',
            featured: true,
            features: [
                { text: 'Unlimited students', included: true },
                { text: 'Advanced scheduling', included: true },
                { text: 'Billing & invoicing', included: true },
                { text: 'SMS notifications', included: true },
                { text: 'Custom branding', included: true },
                { text: 'Custom domain (yourstudio.com)', included: true },
                { text: 'Priority support', included: true },
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For large studios & institutions',
            price: 'Custom',
            color: 'from-emerald-500 to-teal-500',
            icon: Award,
            cta: 'Contact Sales',
            featured: false,
            features: [
                { text: 'Everything in Professional', included: true },
                { text: 'Multiple locations', included: true },
                { text: 'White-label branding', included: true },
                { text: 'API access', included: true },
                { text: 'Dedicated support', included: true },
                { text: 'Custom integrations', included: true },
            ]
        }
    ]

    const faqs = [
        {
            question: 'Is there a free trial?',
            answer: 'Yes! The Professional plan comes with a 14-day free trial. No credit card required. You can explore all features and decide if it\'s right for your studio.'
        },
        {
            question: 'Can I change plans later?',
            answer: 'Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately, and we\'ll prorate any charges.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and ACH bank transfers for annual plans.'
        },
        {
            question: 'Is my data secure?',
            answer: 'Yes. We use industry-standard encryption and security practices to protect your data. All data is encrypted in transit and at rest, and we perform regular security audits.'
        },
        {
            question: 'Can I cancel anytime?',
            answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your data will remain accessible for 30 days after cancellation.'
        },
        {
            question: 'Do you offer discounts for annual billing?',
            answer: 'Yes! Save 20% when you pay annually. Contact us at sales@studiosync.app for annual pricing options.'
        }
    ]

    const handlePlanSelect = (planId: string) => {
        if (planId === 'enterprise') {
            window.location.href = 'mailto:sales@studiosync.app?subject=Enterprise Plan Inquiry'
        } else {
            router.push(`/signup?plan=${planId}`)
        }
    }

    return (
        <>
            <Navigation />

            {/* Animated background */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <FloatingOrb delay={0} duration={25} size={400} opacity={0.12} color="purple" />
                <FloatingOrb delay={5} duration={30} size={300} opacity={0.1} color="indigo" />
                <FloatingOrb delay={10} duration={35} size={350} opacity={0.08} color="blue" />
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
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-purple-200 text-purple-700 font-medium mb-8"
                            >
                                <Sparkles className="w-4 h-4" />
                                Simple, Transparent Pricing
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                <span className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Choose Your
                                </span>
                                <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Perfect Plan
                                </span>
                            </h1>

                            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                                Start free, scale as you grow. No hidden fees, no surprises.
                            </p>

                            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    30-day free trial
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    No credit card required
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    Cancel anytime
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Self-Hosting Callout */}
                <section className="px-4 pb-16">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="relative rounded-3xl overflow-hidden"
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />

                            {/* Decorative orbs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

                            {/* Content */}
                            <div className="relative p-8 md:p-12">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-white">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-medium mb-4">
                                            <Code className="w-4 h-4" />
                                            Open Source
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                            Choose Your Hosting
                                        </h2>
                                        <p className="text-white/90 text-lg mb-6 leading-relaxed">
                                            Use our cloud-based solution for hassle-free management, or self-host for complete control and data ownership. All tiers support both options.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2">
                                                <Check className="w-5 h-5 text-green-300" />
                                                <span className="font-medium">Cloud Hosted</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2">
                                                <Check className="w-5 h-5 text-green-300" />
                                                <span className="font-medium">Self Hosted</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2">
                                                <Check className="w-5 h-5 text-green-300" />
                                                <span className="font-medium">Docker Ready</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Cloud Option */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="relative rounded-2xl overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />
                                            <div className="relative p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 mb-1">Cloud Hosted</h3>
                                                        <p className="text-sm text-gray-600">We manage everything—updates, backups, and infrastructure. Just log in and start using it.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Self-Hosted Option */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="relative rounded-2xl overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />
                                            <div className="relative p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 mb-1">Self Hosted</h3>
                                                        <p className="text-sm text-gray-600">Deploy on your own infrastructure for complete control. Free forever with our open-source codebase.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="px-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Cloud-Hosted Plans
                            </h2>
                            <p className="text-gray-600">
                                Or self-host for free using our open-source code
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 mb-20">
                            {plans.map((plan, index) => (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan}
                                    index={index}
                                    onSelect={handlePlanSelect}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature Comparison */}
                <section className="px-4 pb-20">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Compare Plans
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600">
                                Find the perfect fit for your studio
                            </p>
                        </motion.div>

                        <FeatureComparison />
                    </div>
                </section>

                {/* Trust Indicators */}
                <section className="px-4 pb-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: Shield, title: 'Secure & Compliant', description: 'Bank-level encryption and GDPR compliant' },
                                { icon: Users, title: '500+ Studios', description: 'Trusted by music educators worldwide' },
                                { icon: Zap, title: '99.9% Uptime', description: 'Reliable infrastructure you can count on' }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative rounded-2xl overflow-hidden text-center p-8"
                                >
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border border-white/20" />
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                                            <item.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Frequently Asked Questions
                            </h2>
                        </motion.div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} {...faq} index={index} />
                            ))}
                        </div>
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
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600" />

                            {/* Animated orbs */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                            {/* Content */}
                            <div className="relative px-8 py-16 md:p-16 text-center text-white">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                                    Join hundreds of music studios using StudioSync to streamline their operations.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            href="/signup"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                                        >
                                            Start Your Free Trial
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <a
                                            href="mailto:sales@studiosync.app"
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                                        >
                                            Contact Sales
                                        </a>
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
