'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const C = {
  bg: '#1c1309',
  bgCard: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  amber: '#c17c2e',
  text: '#faf7f2',
  muted: 'rgba(250,247,242,0.5)',
  faint: 'rgba(250,247,242,0.3)',
} as const

const staffLines: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(193,124,46,0.07) 27px,
    rgba(193,124,46,0.07) 28px
  )`,
}

export default function Footer() {
  const t = useTranslations('Footer')
  const year = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: C.bg, ...staffLines }}>
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Logo className="w-8 h-8" />
              <span
                className="text-base font-bold"
                style={{ color: C.text, fontFamily: 'Outfit, sans-serif' }}
              >
                StudioSync
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: C.muted, fontFamily: 'Manrope, sans-serif' }}
            >
              {t('tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: C.amber }}
            >
              {t('product')}
            </p>
            <ul className="space-y-3">
              {[
                { href: '/login', label: t('signIn') },
                { href: '/signup', label: t('getStarted') },
                { href: '/pricing', label: t('pricing') },
                { href: '/about', label: t('about') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: C.muted }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: C.amber }}
            >
              {t('resources')}
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/aviatorcards/StudioSync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: C.muted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >
                  <Github className="w-3.5 h-3.5" />
                  {t('github')}
                </a>
              </li>
              {[
                { href: '/docs', label: t('documentation') },
                { href: '/support', label: t('support') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: C.muted }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <p className="text-xs" style={{ color: C.faint }}>
            {t('copyright', { year })}
          </p>
          <LanguageSwitcher />
          <div className="flex gap-6">
            {[
              { href: '/privacy', label: t('privacy') },
              { href: '/terms', label: t('terms') },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs transition-colors"
                style={{ color: C.faint }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.muted)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.faint)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
