'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserRole } from '@/contexts/UserContext'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { FeatureFlags } from '@/types/setup'
import { Logo } from '@/components/Logo'
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Calendar,
    BookOpen,
    CreditCard,
    Library,
    MessageSquare,
    Bell,
    Target,
    BarChart3,
    Settings,
    Building2,
    UserCog,
    Package,
    FileText,
    Music,
    X,
    Pencil,
    MapPin,
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'

// ─── Design tokens ───────────────────────────────────────────────────────────
const S = {
    bg: '#1c1309',
    border: 'rgba(255,255,255,0.07)',
    amber: '#c17c2e',
    amberBg: 'rgba(193,124,46,0.14)',
    text: 'rgba(250,247,242,0.9)',
    muted: 'rgba(250,247,242,0.5)',
    hoverBg: 'rgba(250,247,242,0.06)',
    badgeBg: 'rgba(193,124,46,0.2)',
} as const

const MobileSidebarPortal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(children, document.body)
}

interface SidebarItem {
    name: string
    href: string
    icon: any
    badge?: string | number
    roles?: UserRole[]
    featureFlag?: keyof FeatureFlags
}

interface SidebarSection {
    title?: string
    items: SidebarItem[]
    roles?: UserRole[]
}

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const { currentUser } = useUser()
    const { flags } = useFeatureFlags()
    const { unreadCount } = useNotifications(60000)

    useEffect(() => {
        onClose()
    }, [pathname, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const sections: SidebarSection[] = [
        {
            title: 'OVERVIEW',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
                { name: 'Studio', href: '/dashboard/studios', icon: Building2, roles: ['admin', 'teacher', 'student'] },
            ],
        },
        {
            title: 'MANAGEMENT',
            items: [
                { name: 'Students', href: '/dashboard/students', icon: Users, roles: ['admin', 'teacher'] },
                { name: 'Bands', href: '/dashboard/bands', icon: Music, roles: ['admin', 'teacher', 'student'], featureFlag: 'bands_enabled' },
                { name: 'Gigs', href: '/dashboard/gigs', icon: MapPin, roles: ['admin', 'teacher', 'student'], featureFlag: 'bands_enabled' },
                { name: 'Instructors', href: '/dashboard/teachers', icon: UserCheck, roles: ['admin'] },
                { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
                { name: 'Lessons', href: '/dashboard/lessons', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
                { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, roles: ['admin', 'teacher', 'student'], featureFlag: 'billing_enabled' },
            ],
        },
        {
            title: 'TOOLS',
            items: [
                { name: 'Resources', href: '/dashboard/resources', icon: Library, roles: ['admin', 'teacher', 'student'], featureFlag: 'resources_enabled' },
                { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, roles: ['admin', 'teacher', 'student'], featureFlag: 'messaging_enabled' },
                { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, roles: ['admin', 'teacher', 'student'] },
                { name: 'Goals', href: '/dashboard/goals', icon: Target, roles: ['admin', 'teacher', 'student'], featureFlag: 'goals_enabled' },
                { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['admin', 'teacher'], featureFlag: 'inventory_enabled' },
                { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['admin'], featureFlag: 'analytics_enabled' },
            ],
        },
        {
            title: 'ADMIN',
            roles: ['admin'],
            items: [
                { name: 'Studio Builder', href: '/dashboard/studio-builder', icon: Pencil, roles: ['admin'] },
                { name: 'Users', href: '/dashboard/users', icon: UserCog, roles: ['admin'] },
            ],
        },
        {
            title: 'SETTINGS',
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin', 'teacher', 'student'] },
            ],
        },
        {
            title: 'HELP',
            items: [
                { name: 'Documentation', href: '/docs', icon: FileText, roles: ['admin', 'teacher', 'student'] },
            ],
        },
    ]

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === href
        return pathname === href || (pathname?.startsWith(href + '/') ?? false)
    }

    const SidebarContent = () => (
        <>
            {/* Logo / brand */}
            <div
                className="p-5 pb-4"
                style={{ borderBottom: `1px solid ${S.border}` }}
            >
                <Link href="/" className="flex items-center gap-2.5 mb-2" onClick={onClose}>
                    <Logo className="w-9 h-9" />
                    <span
                        className="text-base font-bold"
                        style={{ color: S.text, fontFamily: 'Outfit, sans-serif' }}
                    >
                        StudioSync
                    </span>
                </Link>
                <p className="text-xs" style={{ color: S.muted }}>
                    {currentUser?.role
                        ? `${currentUser.role === 'teacher' ? 'Instructor' : currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} dashboard`
                        : 'Studio Management'}
                </p>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 pb-24">
                {sections.map((section, sectionIdx) => {
                    if (section.roles && (!currentUser || !section.roles.includes(currentUser.role))) return null

                    const visibleItems = section.items.filter((item) => {
                        const hasRoleAccess = !item.roles || (currentUser && item.roles.includes(currentUser.role))
                        if (!hasRoleAccess) return false
                        if (item.featureFlag && !flags[item.featureFlag]) return false
                        return true
                    })

                    if (visibleItems.length === 0) return null

                    return (
                        <div key={sectionIdx} className="mb-5">
                            {section.title && (
                                <p
                                    className="px-5 text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                                    style={{ color: S.amber, opacity: 0.75 }}
                                >
                                    {section.title}
                                </p>
                            )}
                            <ul className="space-y-0.5 px-3">
                                {visibleItems.map((item) => {
                                    const active = isActive(item.href)
                                    const isExternal = item.href.startsWith('http')

                                    const itemContent = (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <item.icon
                                                    className="w-4 h-4 flex-shrink-0"
                                                    style={{ color: active ? S.amber : S.muted }}
                                                />
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{ color: active ? S.amber : S.text }}
                                                >
                                                    {item.name}
                                                </span>
                                            </div>
                                            {item.badge !== undefined && (
                                                <span
                                                    className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                                                    style={{
                                                        backgroundColor: S.badgeBg,
                                                        color: S.amber,
                                                    }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )

                                    const itemStyle: React.CSSProperties = {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        transition: 'background-color 0.15s',
                                        backgroundColor: active ? S.amberBg : 'transparent',
                                        borderLeft: active ? `2px solid ${S.amber}` : '2px solid transparent',
                                    }

                                    if (isExternal) {
                                        return (
                                            <li key={item.href}>
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={itemStyle}
                                                    onMouseEnter={(e) => {
                                                        if (!active) e.currentTarget.style.backgroundColor = S.hoverBg
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                                                    }}
                                                >
                                                    {itemContent}
                                                </a>
                                            </li>
                                        )
                                    }

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                style={itemStyle}
                                                onMouseEnter={(e) => {
                                                    if (!active) e.currentTarget.style.backgroundColor = S.hoverBg
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!active) e.currentTarget.style.backgroundColor = active ? S.amberBg : 'transparent'
                                                }}
                                            >
                                                {itemContent}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )
                })}
            </nav>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col z-30"
                style={{ backgroundColor: S.bg }}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <MobileSidebarPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-[100] md:hidden"
                            style={{ backgroundColor: 'rgba(28,19,9,0.6)', backdropFilter: 'blur(2px)' }}
                        />

                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-screen w-64 flex flex-col z-[101] md:hidden"
                            style={{ backgroundColor: S.bg }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="shadow-none"
                                    style={{ color: S.muted }}
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <SidebarContent />
                        </motion.aside>
                    </MobileSidebarPortal>
                )}
            </AnimatePresence>
        </>
    )
}
