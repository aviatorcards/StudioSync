'use client'

import { useState, useRef } from 'react'
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
  Music,
  Star,
  X,
  Check,
  ChevronRight,
  ArrowRight,
  Github,
} from 'lucide-react'

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg: '#faf7f2',
  bgCard: '#f0e8d8',
  bgDark: '#1c1309',
  border: '#e3d4bc',
  amber: '#c17c2e',
  amberDark: '#9e6020',
  amberLight: 'rgba(193,124,46,0.12)',
  text: '#1c1309',
  muted: '#7a6145',
  faint: '#b09870',
  white: '#ffffff',
} as const

const staffLines: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(193,124,46,0.11) 27px,
    rgba(193,124,46,0.11) 28px
  )`,
}

const staffLinesDark: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(193,124,46,0.07) 27px,
    rgba(193,124,46,0.07) 28px
  )`,
}

// ─── Data ───────────────────────────────────────────────────────────────────
const features = [
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Manage students, bands, and track progress with detailed profiles and skill assessments.',
    details: {
      overview:
        'Comprehensive student management designed for music studios. Track individual progress, organize by bands or groups, and maintain detailed profiles for each student.',
      capabilities: [
        'Student profiles with contact information and skill levels',
        'Band/group organization for collaborative billing',
        'Progress tracking and goal setting',
        'Skill level assessment (Beginner → Professional)',
        'Emergency contact and medical notes',
        'Enrollment history and lesson count tracking',
      ],
      benefits: [
        'Keep all student information in one place',
        'Track student growth over time',
        'Organize students into bands for group management',
        'Quick access to emergency contacts',
      ],
    },
  },
  {
    icon: Calendar,
    title: 'Scheduling',
    description: 'Smart calendar with recurring lessons, conflict detection, and calendar sync.',
    details: {
      overview:
        'Intelligent scheduling that handles private lessons, group sessions, and recurring patterns. Built-in conflict detection ensures no double-bookings.',
      capabilities: [
        'Private and group lesson scheduling',
        'Recurring patterns (weekly, bi-weekly, monthly)',
        'Automatic conflict detection',
        'Online and in-person lesson support',
        'Calendar sync with Google Calendar, iCal',
        'Cancellation and rescheduling with reason tracking',
        'Makeup lesson management',
      ],
      benefits: [
        'Never double-book a time slot',
        'Automate recurring lesson creation',
        'Sync with your personal calendar',
        'Flexible rescheduling options',
      ],
    },
  },
  {
    icon: DollarSign,
    title: 'Billing',
    description: 'Automated invoices, payment tracking, and consolidated band-level billing.',
    details: {
      overview:
        'Complete billing for music studios. Generate invoices automatically from lessons, track payments, and manage multiple payment methods.',
      capabilities: [
        'Automated invoice generation from lessons',
        'Multiple payment methods (cash, check, card, ACH)',
        'Payment history and tracking',
        'Late fee automation',
        'Overdue invoice detection',
        'Band-level consolidated billing',
        'Tax calculation and reporting',
      ],
      benefits: [
        'Save time with automatic invoicing',
        'Never miss a payment with tracking',
        'Professional invoice generation',
        'Simplified tax preparation',
      ],
    },
  },
  {
    icon: Notebook,
    title: 'Lesson Notes',
    description: 'Rich lesson documentation, assignments, and progress tracking for students.',
    details: {
      overview:
        'Detailed lesson documentation that helps teachers track student progress and assign practice materials. Students and parents can view notes and assignments.',
      capabilities: [
        'Rich text lesson notes with formatting',
        'Practice assignments and homework tracking',
        'Progress ratings (1–5 scale)',
        'Strengths and improvement areas documentation',
        'Repertoire tracking (pieces being practiced)',
        'File attachments (audio, video, PDFs)',
        'Visibility controls for students and parents',
      ],
      benefits: [
        'Maintain consistent teaching records',
        'Students can review practice assignments',
        'Parents stay informed of progress',
        'Track which pieces students have mastered',
      ],
    },
  },
  {
    icon: Music,
    title: 'Gig Marketplace',
    description: 'Bands can set schedules, claim open gigs, and receive automated payouts.',
    details: {
      overview:
        'A built-in gig management system where bands update their availability, release and pick up gigs, with integrated pay scales.',
      capabilities: [
        'Monthly availability tracking for bands',
        'Gig claims and releases across the network',
        'Built-in pay scales based on gig requirements',
        'Automated payout generation and invoicing',
        'Conflict-free gig assignment',
        'Transparent financial tracking',
      ],
      benefits: [
        'Eliminate the middleman for booking gigs',
        'Streamline scheduling for all bands',
        'Automate financial payouts',
        'Easy gig pickups for available bands',
      ],
    },
  },
  {
    icon: Library,
    title: 'Resources',
    description: 'Digital library, physical item lending, and organized resource sharing.',
    details: {
      overview:
        'Comprehensive resource management for both digital files and physical items. Share sheet music, recordings, and track instrument loans.',
      capabilities: [
        'Digital file sharing (PDFs, audio, video)',
        'Physical item lending library',
        'Checkout and return tracking',
        'Due date management with overdue detection',
        'Tag-based organization',
        'Student-specific or public resource sharing',
        'Quantity tracking for multiple copies',
      ],
      benefits: [
        'Centralized resource library',
        'Track loaned instruments and materials',
        'Share practice recordings with students',
        'Organized by tags and categories',
      ],
    },
  },
  {
    icon: MessageCircle,
    title: 'Messaging',
    description: 'Multi-channel communication with email, SMS, and in-app notifications.',
    details: {
      overview:
        'Multi-channel communication to keep everyone connected. Send automated reminders, direct messages, and announcements through email, SMS, or in-app.',
      capabilities: [
        'In-app messaging between teachers, students, and parents',
        'Automatic email notifications',
        'SMS notifications and alerts',
        'Automated lesson reminders',
        'Invoice and payment notifications',
        'Read/unread tracking',
        'Message threading for conversations',
      ],
      benefits: [
        'Reduce no-shows with automatic reminders',
        'Reach everyone on their preferred channel',
        'Keep communication history organized',
        'Send announcements to all students at once',
      ],
    },
  },
]

// ─── Feature Modal ───────────────────────────────────────────────────────────
function FeatureModal({
  feature,
  isOpen,
  onClose,
}: {
  feature: (typeof features)[0] | null
  isOpen: boolean
  onClose: () => void
}) {
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
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(28,19,9,0.65)', backdropFilter: 'blur(4px)' }}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.45 }}
                className="relative w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                  <div className="p-6" style={{ borderBottom: `1px solid ${C.border}`, ...staffLines }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: C.amberLight }}
                        >
                          <feature.icon className="w-6 h-6" style={{ color: C.amber }} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold" style={{ color: C.text }}>
                            {feature.title}
                          </h2>
                          <p className="text-sm mt-0.5" style={{ color: C.muted }}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 rounded-lg"
                        style={{ color: C.faint }}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: C.amber }}
                      >
                        Overview
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                        {feature.details.overview}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-4"
                        style={{ color: C.amber }}
                      >
                        Capabilities
                      </p>
                      <div className="space-y-2.5">
                        {feature.details.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: C.amberLight }}
                            >
                              <Check className="w-3 h-3" style={{ color: C.amber }} />
                            </div>
                            <p className="text-sm" style={{ color: C.muted }}>
                              {cap}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: C.bgCard }}>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-4"
                        style={{ color: C.amber }}
                      >
                        Key Benefits
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {feature.details.benefits.map((b, i) => (
                          <div
                            key={i}
                            className="rounded-lg p-3 text-sm"
                            style={{
                              backgroundColor: C.bg,
                              border: `1px solid ${C.border}`,
                              color: C.muted,
                            }}
                          >
                            {b}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm"
                        style={{ backgroundColor: C.amber, color: C.white }}
                      >
                        Get started
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

// ─── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({
  feature,
  index,
  onClick,
}: {
  feature: (typeof features)[0]
  index: number
  onClick: () => void
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      onClick={onClick}
      className="text-left group rounded-2xl p-6 w-full transition-all duration-300"
      style={{
        backgroundColor: C.bgCard,
        border: `1px solid ${C.border}`,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.amber
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(193,124,46,0.14)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: C.amberLight }}
      >
        <feature.icon className="w-5 h-5" style={{ color: C.amber }} />
      </div>

      <h3 className="text-base font-bold mb-2" style={{ color: C.text }}>
        {feature.title}
      </h3>

      <p className="text-sm leading-relaxed mb-5" style={{ color: C.muted }}>
        {feature.description}
      </p>

      <div
        className="flex items-center gap-0.5 text-sm font-semibold"
        style={{ color: C.amber }}
      >
        Learn more
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openFeature = (f: (typeof features)[0]) => {
    setSelectedFeature(f)
    setIsModalOpen(true)
  }

  const closeFeature = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedFeature(null), 300)
  }

  return (
    <>
      <FeatureModal feature={selectedFeature} isOpen={isModalOpen} onClose={closeFeature} />

      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-50"
        style={{ scaleX, backgroundColor: C.amber }}
      />

      <Navigation />

      <main style={{ backgroundColor: C.bg }}>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ backgroundColor: C.bg, ...staffLines }}
        >
          {/* Decorative oversized music note */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 pointer-events-none select-none"
            style={{
              fontSize: '380px',
              lineHeight: 1,
              color: C.amber,
              opacity: 0.04,
              fontFamily: 'Georgia, serif',
              transform: 'translate(12%, -8%)',
            }}
          >
            ♩
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-36 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 mb-8 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: C.amberLight,
                  border: `1px solid ${C.border}`,
                  color: C.amber,
                }}
              >
                <Music className="w-3 h-3" />
                Open source · Self-hosted
              </div>

              {/* Headline */}
              <h1
                className="mb-6"
                style={{
                  fontSize: 'clamp(42px, 7.5vw, 90px)',
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: '-0.03em',
                  color: C.text,
                  fontFamily: 'Outfit, sans-serif',
                  maxWidth: '14ch',
                }}
              >
                Run your studio,{' '}
                <span style={{ color: C.amber }}>focus on the music.</span>
              </h1>

              {/* Sub */}
              <p
                className="mb-10"
                style={{
                  fontSize: '19px',
                  color: C.muted,
                  maxWidth: '500px',
                  lineHeight: 1.7,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                Students, scheduling, billing, and communication — all in tune, all in one
                place. Free and open source.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-sm"
                  style={{ backgroundColor: C.amber, color: C.white }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = C.amberDark)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = C.amber)
                  }
                >
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://github.com/aviatorcards/StudioSync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-sm"
                  style={{
                    backgroundColor: C.bgCard,
                    color: C.text,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
              </div>

              <p className="text-xs" style={{ color: C.faint }}>
                Free & open source · GPL-3.0 · Docker ready in minutes
              </p>
            </motion.div>

            {/* Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.35 }}
              className="mt-20 relative"
            >
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  border: `1px solid ${C.border}`,
                  boxShadow: `0 32px 80px rgba(28,19,9,0.14)`,
                }}
              >
                {/* Browser chrome */}
                <div
                  className="h-9 flex items-center px-4 gap-1.5"
                  style={{
                    backgroundColor: C.bgCard,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'rgba(220,100,60,0.7)' }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'rgba(220,180,60,0.7)' }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'rgba(100,190,100,0.7)' }}
                  />
                  <div
                    className="mx-auto flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest"
                    style={{
                      backgroundColor: C.bg,
                      color: C.faint,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: C.amber, opacity: 0.7 }}
                    />
                    studiosync.cc
                  </div>
                </div>

                <div className="aspect-[16/9] relative">
                  <Image
                    src="/dashboard_preview.png"
                    alt="StudioSync Dashboard"
                    fill
                    className="object-cover object-left-top scale-[1.01]"
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </div>
              </div>

              {/* Floating toast — left */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="absolute top-1/3 -left-4 md:-left-14 hidden md:flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(80,180,80,0.12)' }}
                >
                  <Check className="w-5 h-5" style={{ color: '#3d9e3d' }} />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: C.text }}>
                    Lesson confirmed
                  </div>
                  <div className="text-[11px]" style={{ color: C.muted }}>
                    Sarah · Piano · 3 PM
                  </div>
                </div>
              </motion.div>

              {/* Floating toast — right */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="absolute top-1/2 -right-4 md:-right-14 hidden md:flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: C.amberLight }}
                >
                  <DollarSign className="w-5 h-5" style={{ color: C.amber }} />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: C.text }}>
                    Invoice paid
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: C.amber }}>
                    +$240.00
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Tagline bar ───────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
            backgroundColor: C.bgCard,
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-x-14 gap-y-4">
            {[
              { label: 'Free & open source', sub: 'GPL-3.0 licensed' },
              { label: 'Self-hosted', sub: 'Your data, your server' },
              { label: 'Docker ready', sub: 'Up in minutes' },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: C.amber }}
                />
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>
                    {label}
                  </div>
                  <div className="text-xs" style={{ color: C.muted }}>
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section className="py-24 px-6" style={{ backgroundColor: C.bg }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: C.amber }}
              >
                Features
              </p>
              <h2
                className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
                style={{
                  color: C.text,
                  letterSpacing: '-0.025em',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Everything in tune
              </h2>
              <p
                className="text-lg max-w-lg"
                style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}
              >
                Seven modules that work in harmony — from first lesson to final invoice.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <FeatureCard key={i} feature={f} index={i} onClick={() => openFeature(f)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Open-source CTA ───────────────────────────────────────────────── */}
        <section className="py-24 px-6" style={{ backgroundColor: C.bg }}>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${C.border}` }}
            >
              <div
                className="p-8 md:p-14"
                style={{ backgroundColor: C.bgCard, ...staffLines }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: C.amber }}
                >
                  Open source
                </p>
                <h2
                  className="text-2xl md:text-4xl font-extrabold mb-4"
                  style={{
                    color: C.text,
                    letterSpacing: '-0.025em',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Deploy in under five minutes.
                </h2>
                <p
                  className="text-base mb-8 max-w-lg"
                  style={{ color: C.muted, fontFamily: 'Manrope, sans-serif', lineHeight: 1.7 }}
                >
                  One command spins up the full stack — PostgreSQL, Django, and Next.js. Your
                  data stays on your server, always.
                </p>

                <div
                  className="rounded-xl p-5 mb-8 font-mono text-sm leading-7 overflow-x-auto"
                  style={{ backgroundColor: C.bgDark, color: '#e8d5b0' }}
                >
                  <div style={{ color: 'rgba(176,152,112,0.6)' }}>
                    $ git clone https://github.com/aviatorcards/StudioSync
                  </div>
                  <div style={{ color: 'rgba(176,152,112,0.6)' }}>$ cd StudioSync</div>
                  <div>
                    <span style={{ color: C.amber }}>$</span>{' '}
                    <span>./scripts/init-production.sh</span>
                  </div>
                  <div style={{ color: '#82c582', marginTop: '4px' }}>
                    ✓ Studio ready at http://localhost:3000
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm"
                    style={{ backgroundColor: C.amber, color: C.white }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = C.amberDark)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = C.amber)
                    }
                  >
                    Create your studio
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="https://github.com/aviatorcards/StudioSync"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm"
                    style={{
                      backgroundColor: C.bg,
                      color: C.text,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <Github className="w-4 h-4" />
                    Star on GitHub
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
