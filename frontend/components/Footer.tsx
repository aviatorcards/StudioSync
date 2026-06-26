import Link from 'next/link'
import { Github } from 'lucide-react'
import { Logo } from '@/components/Logo'
import CurrentYear from './CurrentYear'

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
              Open-source platform for musicians and studios. Gigs, scheduling,
              billing, and communication — all in one place.
            </p>
          </div>

          {/* Product */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: C.amber }}
            >
              Product
            </p>
            <ul className="space-y-3">
              {[
                { href: '/login', label: 'Sign in' },
                { href: '/signup', label: 'Get started' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/about', label: 'About' },
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
              Resources
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
                  GitHub
                </a>
              </li>
              {[
                { href: '/docs', label: 'Documentation' },
                { href: '/support', label: 'Support' },
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
            © <CurrentYear /> StudioSync · Open source software · GPL-3.0
          </p>
          <div className="flex gap-6">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
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
