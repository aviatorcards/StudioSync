'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  GraduationCap,
  Calendar,
  DollarSign,
  Notebook,
  Library,
  MessageCircle,
  ArrowRight,
  Check,
  Music,
  Sparkles,
  Star,
  X
} from 'lucide-react'

const features = [
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Manage students, bands, and track progress',
    color: 'from-earth-primary to-earth-dark',
    size: 'large',
    details: {
      overview: 'Comprehensive student management system designed for music studios. Track individual progress, organize by bands or groups, and maintain detailed profiles for each student.',
      capabilities: [
        'Student profiles with contact information and skill levels',
        'Band/group organization for collaborative billing',
        'Progress tracking and goal setting',
        'Skill level assessment (Beginner → Professional)',
        'Emergency contact and medical notes',
        'Enrollment history and lesson count tracking'
      ],
      benefits: [
        'Keep all student information in one place',
        'Track student growth over time',
        'Organize students into bands for group management',
        'Quick access to emergency contacts'
      ]
    }
  },
  {
    icon: Calendar,
    title: 'Scheduling',
    description: 'Smart calendar with recurring lessons',
    color: 'from-olive-primary to-olive-dark',
    size: 'medium',
    details: {
      overview: 'Intelligent scheduling system that handles private lessons, group sessions, and recurring patterns. Built-in conflict detection ensures no double-bookings.',
      capabilities: [
        'Private and group lesson scheduling',
        'Recurring patterns (weekly, bi-weekly, monthly)',
        'Automatic conflict detection',
        'Online and in-person lesson support',
        'Calendar sync with Google Calendar, iCal',
        'Cancellation and rescheduling with reason tracking',
        'Makeup lesson management'
      ],
      benefits: [
        'Never double-book a time slot',
        'Automate recurring lesson creation',
        'Sync with your personal calendar',
        'Flexible rescheduling options'
      ]
    }
  },
  {
    icon: DollarSign,
    title: 'Billing',
    description: 'Automated invoices and payment tracking',
    color: 'from-earth-light to-earth-primary',
    size: 'medium',
    details: {
      overview: 'Complete billing solution for music studios. Generate invoices automatically from lessons, track payments, and manage multiple payment methods.',
      capabilities: [
        'Automated invoice generation from lessons',
        'Multiple payment methods (cash, check, card, ACH)',
        'Payment history and tracking',
        'Late fee automation',
        'Overdue invoice detection',
        'Band-level consolidated billing',
        'Tax calculation and reporting'
      ],
      benefits: [
        'Save time with automatic invoicing',
        'Never miss a payment with tracking',
        'Professional invoice generation',
        'Simplified tax preparation'
      ]
    }
  },
  {
    icon: Notebook,
    title: 'Lesson Notes',
    description: 'Rich lesson documentation and assignments',
    color: 'from-olive-light to-olive-primary',
    size: 'small',
    details: {
      overview: 'Detailed lesson documentation system that helps teachers track student progress and assign practice materials. Students and parents can view notes and assignments.',
      capabilities: [
        'Rich text lesson notes with formatting',
        'Practice assignments and homework tracking',
        'Progress ratings (1-5 scale)',
        'Strengths and improvement areas documentation',
        'Repertoire tracking (pieces being practiced)',
        'File attachments (audio, video, PDFs)',
        'Visibility controls for students and parents'
      ],
      benefits: [
        'Maintain consistent teaching records',
        'Students can review practice assignments',
        'Parents stay informed of progress',
        'Track which pieces students have mastered'
      ]
    }
  },
  {
    icon: Library,
    title: 'Resources',
    description: 'Digital library and lending management',
    color: 'from-earth-lighter to-earth-light',
    size: 'small',
    details: {
      overview: 'Comprehensive resource management for both digital files and physical items. Share sheet music, recordings, and track instrument loans.',
      capabilities: [
        'Digital file sharing (PDFs, audio, video)',
        'Physical item lending library',
        'Checkout and return tracking',
        'Due date management with overdue detection',
        'Tag-based organization',
        'Student-specific or public resource sharing',
        'Quantity tracking for multiple copies'
      ],
      benefits: [
        'Centralized resource library',
        'Track loaned instruments and materials',
        'Share practice recordings with students',
        'Organized by tags and categories'
      ]
    }
  },
  {
    icon: MessageCircle,
    title: 'Messaging',
    description: 'Communication with email and SMS',
    color: 'from-neutral-medium to-neutral-dark',
    size: 'small',
    details: {
      overview: 'Multi-channel communication system to keep everyone connected. Send automated reminders, direct messages, and announcements through email, SMS, or in-app notifications.',
      capabilities: [
        'In-app messaging between teachers, students, and parents',
        'Email notifications via SendGrid',
        'SMS notifications via Twilio',
        'Automated lesson reminders',
        'Invoice and payment notifications',
        'Read/unread tracking',
        'Message threading for conversations'
      ],
      benefits: [
        'Reduce no-shows with automatic reminders',
        'Reach everyone on their preferred channel',
        'Keep communication history organized',
        'Send announcements to all students at once'
      ]
    }
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Piano Studio Owner',
    studio: 'Harmony Keys Academy',
    content: 'StudioSync transformed how I manage my 45 students. What used to take hours now takes minutes.',
    rating: 5
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Guitar Instructor',
    studio: 'String Theory Studio',
    content: 'The automated billing alone pays for itself. My students love the lesson reminders too.',
    rating: 5
  },
  {
    name: 'Emily Thompson',
    role: 'Multi-Instrument Studio',
    studio: 'Crescendo Music School',
    content: 'Managing 5 teachers and 120+ students has never been easier. Game changer.',
    rating: 5
  }
]

const stats = [
  { value: '500+', label: 'Music Studios' },
  { value: '50K+', label: 'Students Managed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Rating' }
]

function AnimatedCounter({ value, inView }: { value: string, inView: boolean }) {
  const [count, setCount] = useState('0')

  useEffect(() => {
    if (!inView) return

    const numValue = value.replace(/[^0-9.]/g, '')
    const hasDecimal = value.includes('.')
    const suffix = value.replace(/[0-9.]/g, '')

    if (hasDecimal) {
      setCount(value)
      return
    }

    const target = parseInt(numValue)
    const duration = 2000
    const steps = 50
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current) + suffix)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [inView, value])

  return <span>{count}</span>
}

function FloatingOrb({ delay = 0, duration = 20, size = 300, opacity = 0.15, color = 'earth-primary' }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl bg-${color}`}
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

function FeatureModal({ feature, isOpen, onClose }: { feature: typeof features[0] | null, isOpen: boolean, onClose: () => void }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!feature) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Glassmorphic container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  {/* Glass background */}
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl" />

                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${feature.color}`} />

                  {/* Content */}
                  <div className="relative max-h-[80vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                            <feature.icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold text-gray-900">{feature.title}</h2>
                            <p className="text-gray-600 mt-1">{feature.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={onClose}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <X className="w-6 h-6 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-8">
                      {/* Overview */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
                        <p className="text-gray-700 leading-relaxed">{feature.details.overview}</p>
                      </motion.div>

                      {/* Capabilities */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Capabilities</h3>
                        <div className="space-y-3">
                          {feature.details.capabilities.map((capability, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.05 }}
                              className="flex items-start gap-3"
                            >
                              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <p className="text-gray-700">{capability}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Benefits */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative rounded-2xl overflow-hidden"
                      >
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`} />

                        <div className="relative p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {feature.details.benefits.map((benefit, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + idx * 0.05 }}
                                className="flex items-start gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3"
                              >
                                <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                                <p className="text-gray-700 text-sm">{benefit}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* CTA */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-center pt-4"
                      >
                        <Link
                          href="/signup"
                          className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${feature.color} text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all`}
                        >
                          Sign Up Now
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Decorative blur */}
                <div className={`absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br ${feature.color} rounded-full opacity-20 blur-3xl -z-10`} />
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function FeatureCard({ feature, index, onClick }: { feature: typeof features[0], index: number, onClick: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const sizeClasses: Record<string, string> = {
    large: 'md:col-span-2 md:row-span-2',
    medium: 'md:col-span-1 md:row-span-2',
    small: 'md:col-span-1 md:row-span-1'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative ${sizeClasses[feature.size]} rounded-3xl overflow-hidden cursor-pointer`}
      onClick={onClick}
    >
      {/* Glassmorphic card */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl" />

      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

      {/* Content */}
      <div className="relative h-full p-8 flex flex-col justify-between">
        <div>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            <feature.icon className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-earth-primary group-hover:to-olive-dark transition-all">
            {feature.title}
          </h3>

          <p className="text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Learn more button - shown on all cards */}
        <div className="mt-8">
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center text-earth-dark font-semibold group/btn"
          >
            Learn more
            <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>

      {/* Decorative element */}
      <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.color} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
    </motion.div>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-xl h-full"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed italic">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-earth-primary to-olive-dark flex items-center justify-center text-white font-bold text-lg">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-bold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-600">{testimonial.role}</div>
          <div className="text-sm text-earth-dark">{testimonial.studio}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })

  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFeatureClick = (feature: typeof features[0]) => {
    setSelectedFeature(feature)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedFeature(null), 300) // Wait for exit animation
  }

  return (
    <>
      {/* Feature Detail Modal */}
      <FeatureModal feature={selectedFeature} isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-earth-primary via-olive-primary to-earth-light origin-left z-50"
        style={{ scaleX }}
      />

      <Navigation />

      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-earth-lighter via-neutral-light to-olive-light">
        <FloatingOrb delay={0} duration={25} size={400} opacity={0.12} color="earth-primary" />
        <FloatingOrb delay={5} duration={30} size={300} opacity={0.1} color="olive-primary" />
        <FloatingOrb delay={10} duration={35} size={350} opacity={0.08} color="earth-light" />

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
        <section ref={heroRef} className="min-h-screen flex items-center justify-center px-4 py-20 md:py-32">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-earth-light text-earth-dark font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                Join 500+ music studios
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-earth-dark via-earth-primary to-earth-dark bg-clip-text text-transparent">
                  Orchestrate
                </span>
                <span className="block bg-gradient-to-r from-earth-primary to-olive-dark bg-clip-text text-transparent">
                  Your Studio
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                The all-in-one platform that harmonizes{' '}
                <span className="font-semibold text-earth-dark">students</span>,{' '}
                <span className="font-semibold text-olive-dark">scheduling</span>, and{' '}
                <span className="font-semibold text-earth-primary">billing</span>{' '}
                — so you can focus on what matters: making music.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/signup"
                    className="group px-8 py-4 bg-gradient-to-r from-earth-primary to-olive-dark text-white rounded-2xl font-semibold text-lg shadow-xl shadow-earth-primary/30 hover:shadow-2xl hover:shadow-earth-primary/40 transition-all flex items-center gap-2"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button className="px-8 py-4 bg-white/60 backdrop-blur-md border border-white/50 text-gray-900 rounded-2xl font-semibold text-lg hover:bg-white/80 transition-all flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Watch Demo
                  </button>
                </motion.div>
              </div>

              <p className="mt-8 text-sm text-gray-600">
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </motion.div>

            {/* Hero illustration placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-20 relative"
            >
              <div className="relative max-w-5xl mx-auto">
                {/* Glassmorphic mockup */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-earth-primary/20 border border-white/30 bg-white/40 backdrop-blur-xl">
                  <div className="aspect-video relative">
                    {/* Dashboard Preview Image */}
                    <Image
                      src="/dashboard_preview.png"
                      alt="StudioSync Dashboard Preview"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-4 top-1/4 md:-left-12 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 hidden md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-olive-primary flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Lesson Confirmed</div>
                      <div className="text-xs text-gray-600">Sarah&apos;s piano lesson</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -right-4 top-1/3 md:-right-12 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 hidden md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-earth-primary flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Payment Received</div>
                      <div className="text-xs text-gray-600">$250.00</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={statsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-earth-primary to-olive-dark bg-clip-text text-transparent mb-2">
                    <AnimatedCounter value={stat.value} inView={statsInView} />
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-neutral-dark to-neutral-medium bg-clip-text text-transparent">
                  Everything You Need,
                </span>
                <br />
                <span className="bg-gradient-to-r from-earth-primary to-olive-dark bg-clip-text text-transparent">
                  Beautifully Simple
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features that work in harmony to run your studio smoothly
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  onClick={() => handleFeatureClick(feature)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neutral-dark to-neutral-medium bg-clip-text text-transparent">
                Loved by Music Educators
              </h2>
              <p className="text-xl text-gray-600">
                Join hundreds of studios making beautiful music
              </p>
            </motion.div>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4">
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
                  Join 500+ music studios using StudioSync to manage students, schedules, and billing effortlessly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-earth-dark rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                    >
                      Start Your Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                    >
                      View Pricing
                    </Link>
                  </motion.div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    30-day free trial
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Cancel anytime
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
