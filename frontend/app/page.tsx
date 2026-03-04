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
  X,
  ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Manage students, bands, and track progress with detailed profiles and skill assessments.',
    color: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-50 text-indigo-600',
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
    description: 'Smart calendar with recurring lessons, conflict detection, and calendar sync.',
    color: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
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
    description: 'Automated invoices, payment tracking, and consolidated band-level billing.',
    color: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-50 text-purple-600',
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
    description: 'Rich lesson documentation, assignments, and progress tracking for students.',
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50 text-amber-600',
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
    description: 'Digital library, physical item lending, and organized resource sharing.',
    color: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-50 text-cyan-600',
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
    description: 'Multi-channel communication with email, SMS, and in-app notifications.',
    color: 'from-pink-500 to-rose-500',
    iconBg: 'bg-pink-50 text-pink-600',
    details: {
      overview: 'Multi-channel communication system to keep everyone connected. Send automated reminders, direct messages, and announcements through email, SMS, or in-app notifications.',
      capabilities: [
        'In-app messaging between teachers, students, and parents',
        'Automatic email notifications',
        'SMS notifications and alerts',
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

function FeatureModal({ feature, isOpen, onClose }: { feature: typeof features[0] | null, isOpen: boolean, onClose: () => void }) {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

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
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 p-6 z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{feature.title}</h2>
                          <p className="text-gray-500 mt-0.5">{feature.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
                    {/* Overview */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Overview</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.details.overview}</p>
                    </div>

                    {/* Capabilities */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Capabilities</h3>
                      <div className="space-y-2.5">
                        {feature.details.capabilities.map((capability, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <p className="text-gray-600 text-sm">{capability}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Key Benefits</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {feature.details.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 bg-white rounded-lg p-3 border border-gray-100">
                            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-600 text-sm">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center pt-2">
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Get Started Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
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
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
        <feature.icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {feature.title}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed mb-4">
        {feature.description}
      </p>

      <div className="flex items-center text-indigo-600 text-sm font-semibold group-hover:gap-2 transition-all">
        Learn more
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.div>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <p className="text-gray-600 mb-5 leading-relaxed text-sm">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
          <div className="text-xs text-gray-500">{testimonial.role} · {testimonial.studio}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const heroRef = useRef(null)

  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFeatureClick = (feature: typeof features[0]) => {
    setSelectedFeature(feature)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedFeature(null), 300)
  }

  return (
    <>
      <FeatureModal feature={selectedFeature} isOpen={isModalOpen} onClose={handleCloseModal} />

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 origin-left z-50"
        style={{ scaleX }}
      />

      <Navigation />

      <main className="bg-gray-50">
        {/* Hero Section */}
        <section ref={heroRef} className="relative overflow-hidden bg-white border-b border-gray-100">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />

          <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Open source studio management
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                Orchestrate your{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  music studio
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                The all-in-one platform that harmonizes students, scheduling, and billing — so you can focus on what matters: making music.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/signup"
                  className="group px-7 py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-base hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/10"
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button className="px-7 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-base hover:bg-gray-50 transition-all flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Watch Demo
                </button>
              </div>

              <p className="mt-6 text-sm text-gray-400">
                Free and open-source · Easy deployment · Community supported
              </p>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 relative max-w-5xl mx-auto"
            >
              {/* Background Glow */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-[100px] opacity-70 -z-10" />

              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-200 bg-white">
                {/* Browser-like Window Header */}
                <div className="h-10 bg-gray-50/80 border-b border-gray-100 flex items-center px-4 gap-1.5 backdrop-blur-md relative z-10 font-sans">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm shadow-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-sm shadow-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80 shadow-sm shadow-emerald-500/20" />
                  <div className="mx-auto flex items-center gap-2 bg-white/50 rounded-md px-3 py-1 border border-gray-100/50">
                    <div className="w-3 h-3 rounded-full border border-indigo-200 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">studiosync.app</span>
                  </div>
                </div>

                <div className="aspect-[16/9] relative">
                  <Image
                    src="/dashboard_preview.png"
                    alt="StudioSync Dashboard Preview"
                    fill
                    className="object-cover object-left-top scale-[1.02]"
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </div>
              </div>

              {/* Modern Toasts */}
              <div className="absolute -left-6 top-1/4 md:-left-16 glass-card rounded-2xl p-4 shadow-2xl border border-white/60 hidden md:flex items-center gap-4 animate-float-card group z-20">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[13px] font-extrabold text-gray-900 leading-tight">Lesson Confirmed</div>
                  <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Sarah&apos;s piano lesson</div>
                </div>
              </div>

              <div className="absolute -right-6 top-1/2 md:-right-16 glass-card rounded-2xl p-4 shadow-2xl border border-white/60 hidden md:flex items-center gap-4 animate-float-card-delayed group z-20">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[13px] font-extrabold text-gray-900 leading-tight">Payment Received</div>
                  <div className="text-[11px] text-indigo-600 font-bold mt-0.5">+$250.00</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need, beautifully simple
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Powerful features that work in harmony to run your studio smoothly
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* Testimonials */}
        <section className="py-20 md:py-28 px-4 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Loved by music educators
              </h2>
              <p className="text-lg text-gray-500">
                See why music educators love StudioSync
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 rounded-2xl overflow-hidden relative"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />

              <div className="relative px-8 py-16 md:p-16 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to transform your studio?
                </h2>
                <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
                  Try StudioSync and manage students, schedules, and billing effortlessly.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 transition-colors"
                  >
                    View Pricing
                  </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-5 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Open source
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Self-hosted
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Docker ready
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
