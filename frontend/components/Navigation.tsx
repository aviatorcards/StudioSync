'use client'

import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'

const C = {
  bg: '#faf7f2',
  bgCard: '#f0e8d8',
  border: '#e3d4bc',
  amber: '#c17c2e',
  amberDark: '#9e6020',
  text: '#1c1309',
  muted: '#7a6145',
  white: '#ffffff',
} as const

const MobileMenuPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/docs', label: 'Docs' },
  ]

  return (
    <nav
      className="sticky top-0 z-40 transition-shadow duration-200"
      style={{
        backgroundColor: C.bg,
        borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
        boxShadow: scrolled ? `0 1px 24px rgba(28,19,9,0.06)` : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group z-50">
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform duration-200" />
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: C.text, fontFamily: 'Outfit, sans-serif' }}
            >
              StudioSync
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative"
                style={{
                  color: isActive(link.href) ? C.amber : C.muted,
                  backgroundColor: isActive(link.href) ? C.bgCard : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.color = C.text
                    e.currentTarget.style.backgroundColor = C.bgCard
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.color = C.muted
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: C.amber }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: C.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: C.amber, color: C.white }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.amberDark)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.amber)}
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden z-50 p-2 rounded-lg transition-colors"
            style={{ color: C.muted }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenuPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] md:hidden flex flex-col"
              style={{ backgroundColor: C.bg }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Logo className="w-8 h-8" />
                  <span
                    className="text-base font-bold"
                    style={{ color: C.text, fontFamily: 'Outfit, sans-serif' }}
                  >
                    StudioSync
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg"
                  style={{ color: C.muted }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 p-5 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-4 py-3 rounded-xl text-base font-medium transition-colors"
                      style={{
                        color: isActive(link.href) ? C.amber : C.text,
                        backgroundColor: isActive(link.href) ? C.bgCard : 'transparent',
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Auth */}
              <div className="p-5 space-y-2.5" style={{ borderTop: `1px solid ${C.border}` }}>
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-center font-medium rounded-xl transition-colors"
                  style={{
                    backgroundColor: C.bgCard,
                    color: C.text,
                    border: `1px solid ${C.border}`,
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 text-center font-semibold rounded-xl transition-colors"
                  style={{ backgroundColor: C.amber, color: C.white }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up free
                </Link>
              </div>
            </motion.div>
          </MobileMenuPortal>
        )}
      </AnimatePresence>
    </nav>
  )
}
