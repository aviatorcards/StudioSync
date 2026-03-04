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
    Code,
    ChevronDown
} from 'lucide-react'

function PricingCard({ plan, index, onSelect }: any) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative ${plan.featured ? 'md:scale-105' : ''}`}
        >
            {/* Featured Badge */}
            {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-2xl border ${plan.featured ? 'border-gray-900 shadow-lg' : 'border-gray-100 hover:shadow-md'} transition-all overflow-hidden`}>
                <div className="p-7">
                    {/* Plan Header */}
                    <div className="mb-6">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                            <plan.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                        <p className="text-gray-500 text-sm">{plan.description}</p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6">
                        {plan.price === 'Custom' ? (
                            <div className="text-3xl font-bold text-gray-900">Custom</div>
                        ) : plan.price === 'Free' ? (
                            <div className="text-3xl font-bold text-gray-900">Free</div>
                        ) : (
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                <span className="text-gray-400 ml-1.5 text-sm">/month</span>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-7">
                        {plan.features.map((feature: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                {feature.included ? (
                                    <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-emerald-600" />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <X className="w-3 h-3 text-gray-300" />
                                    </div>
                                )}
                                <span className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {feature.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                        onClick={() => onSelect(plan.id)}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.featured
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        {plan.cta}
                    </button>

                    {plan.featured && (
                        <p className="text-xs text-center text-gray-400 mt-3">
                            14-day free trial · No credit card required
                        </p>
                    )}
                </div>
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

    const renderCell = (value: string | boolean, isPro: boolean = false) => {
        if (typeof value === 'boolean') {
            return value ? (
                <Check className={`w-4 h-4 ${isPro ? 'text-indigo-600' : 'text-emerald-500'} mx-auto`} />
            ) : (
                <div className="w-4 h-4 mx-auto text-gray-300 text-center text-sm">—</div>
            )
        }
        return <span className={`text-sm ${isPro ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{value}</span>
    }

    return (
        <div ref={ref}>
            {/* Desktop Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left p-5 text-sm font-semibold text-gray-900 w-1/4">Features</th>
                            <th className="text-center p-5 text-sm font-semibold text-gray-500 w-1/4">Starter</th>
                            <th className="text-center p-5 text-sm font-semibold w-1/4 bg-indigo-50/50">
                                <span className="text-indigo-600">Professional</span>
                            </th>
                            <th className="text-center p-5 text-sm font-semibold text-gray-500 w-1/4">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature, idx) => (
                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 text-sm text-gray-700 pl-5">{feature.name}</td>
                                <td className="p-4 text-center">{renderCell(feature.starter)}</td>
                                <td className="p-4 text-center bg-indigo-50/30">{renderCell(feature.pro, true)}</td>
                                <td className="p-4 text-center">{renderCell(feature.enterprise)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                        transition={{ duration: 0.4, delay: idx * 0.04 }}
                        className="bg-white rounded-xl border border-gray-100 p-4"
                    >
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">{feature.name}</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Starter</span>
                                {renderCell(feature.starter)}
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                                <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1.5">Pro</span>
                                {renderCell(feature.pro, true)}
                            </div>
                            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Enterprise</span>
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

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
                <h3 className="font-semibold text-sm text-gray-900 pr-4">{question}</h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{answer}</p>
            </motion.div>
        </div>
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
            color: 'from-indigo-500 to-purple-500',
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
                                Simple, Transparent Pricing
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                                Choose your{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    perfect plan
                                </span>
                            </h1>

                            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                                Start free, scale as you grow. No hidden fees, no surprises.
                            </p>

                            <div className="flex items-center justify-center gap-5 text-sm text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    30-day free trial
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    No credit card required
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    Cancel anytime
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Self-Hosting Callout */}
                <section className="px-4 py-16">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-gray-900 rounded-2xl overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-purple-600/15" />

                            <div className="relative p-8 md:p-10">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-white">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium mb-4">
                                            <Code className="w-3.5 h-3.5" />
                                            Open Source
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-3">
                                            Choose your hosting
                                        </h2>
                                        <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                                            Use our cloud-based solution for hassle-free management, or self-host for complete control and data ownership.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Cloud Hosted', 'Self Hosted', 'Docker Ready'].map((label) => (
                                                <div key={label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="font-medium">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Cloud Option */}
                                        <div className="bg-white rounded-xl p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">Cloud Hosted</h3>
                                                    <p className="text-xs text-gray-500">We manage everything — updates, backups, and infrastructure.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Self-Hosted Option */}
                                        <div className="bg-white rounded-xl p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">Self Hosted</h3>
                                                    <p className="text-xs text-gray-500">Deploy on your own infrastructure. Free forever with open-source.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="px-4 pb-20">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                                Cloud-Hosted Plans
                            </h2>
                            <p className="text-gray-500">
                                Or self-host for free using our open-source code
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6 mb-20">
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
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                                Compare Plans
                            </h2>
                            <p className="text-gray-500">
                                Find the perfect fit for your studio
                            </p>
                        </motion.div>

                        <FeatureComparison />
                    </div>
                </section>

                {/* Trust Indicators */}
                <section className="px-4 pb-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-5">
                            {[
                                { icon: Shield, title: 'Secure & Compliant', description: 'Bank-level encryption and GDPR compliant' },
                                { icon: Users, title: 'Trusted by Studios', description: 'Used by music educators worldwide' },
                                { icon: Zap, title: 'Reliable Uptime', description: 'Infrastructure you can count on' }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl border border-gray-100 text-center p-7"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4`}>
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{item.title}</h3>
                                    <p className="text-gray-500 text-xs">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                                Frequently asked questions
                            </h2>
                        </motion.div>

                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} {...faq} index={index} />
                            ))}
                        </div>
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
                            className="bg-gray-900 rounded-2xl overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />

                            <div className="relative px-8 py-14 md:p-14 text-center text-white">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Ready to get started?
                                </h2>
                                <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
                                    Try StudioSync and streamline your studio operations today.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        Start Your Free Trial
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    <a
                                        href="mailto:sales@studiosync.app"
                                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 transition-colors"
                                    >
                                        Contact Sales
                                    </a>
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
