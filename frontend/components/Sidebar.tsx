'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserRole } from '@/contexts/UserContext'
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
    Target,
    BarChart3,
    Settings,
    Building2,
    UserCog,
    Package,
    FileText,
    Music,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Portal component for mobile menu to break out of parent stacking contexts
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

    // Close sidebar on route change (mobile)
    useEffect(() => {
        onClose()
    }, [pathname, onClose])

    // Prevent body scroll when mobile sidebar is open
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

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const sections: SidebarSection[] = [
        {
            title: 'OVERVIEW',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
            ],
        },
        {
            title: 'MANAGEMENT',
            items: [
                { name: 'Students', href: '/dashboard/students', icon: Users, roles: ['admin', 'teacher'] },
                { name: 'Bands', href: '/dashboard/bands', icon: Music, roles: ['admin', 'teacher', 'student'] },
                { name: 'Instructors', href: '/dashboard/teachers', icon: UserCheck, roles: ['admin'] },
                { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
                { name: 'Lessons', href: '/dashboard/lessons', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
                { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, roles: ['admin', 'student'] },
            ],
        },
        {
            title: 'TOOLS',
            items: [
                { name: 'Resources', href: '/dashboard/resources', icon: Library, roles: ['admin', 'teacher', 'student'] },
                { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, roles: ['admin', 'teacher', 'student'] },
                { name: 'Goals', href: '/dashboard/goals', icon: Target, roles: ['admin', 'teacher', 'student'] },
                { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['admin', 'teacher'] },
                { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['admin'] },
            ],
        },
        {
            title: 'ADMIN',
            roles: ['admin'],
            items: [
                { name: 'Studios', href: '/dashboard/studios', icon: Building2, roles: ['admin'] },
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
        if (href === '/dashboard') {
            return pathname === href
        }
        // Check exact match or if pathname starts with href followed by /
        return pathname === href || (pathname?.startsWith(href + '/') ?? false)
    }

    // Shared sidebar content component
    const SidebarContent = () => (
        <>
            {/* Logo/Brand */}
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center space-x-3" onClick={onClose}>
                    <Logo className="w-10 h-10" />
                    <span className="text-xl font-bold">StudioSync</span>
                </Link>
                <p className="text-xs text-white/60 mt-1">
                    {currentUser?.role ? `Dashboard - ${currentUser.role === 'teacher' ? 'instructor' : currentUser.role}` : 'Studio Management'}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 pb-24">
                {sections.map((section, sectionIdx) => {
                    // Check section role visibility
                    if (section.roles && (!currentUser || !section.roles.includes(currentUser.role))) return null

                    // Filter items by role
                    const visibleItems = section.items.filter(item =>
                        !item.roles || (currentUser && item.roles.includes(currentUser.role))
                    )

                    if (visibleItems.length === 0) return null

                    return (
                        <div key={sectionIdx} className="mb-6">
                            {section.title && (
                                <h3 className="px-6 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                                    {section.title}
                                </h3>
                            )}
                            <ul className="space-y-1 px-3">
                                {visibleItems.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isActive(item.href)
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <item.icon className="w-5 h-5" />
                                                <span className="text-sm">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="bg-[#F39C12] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })}
            </nav>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar - Always visible on md+ screens */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[#2C3E50] text-white flex-col z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar - Portal-based overlay */}
            {/* Mobile Sidebar - Portal-based overlay */}
            <AnimatePresence>
                {isOpen && (
                    <MobileSidebarPortal>
                        {/* Overlay backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/50 z-[100] md:hidden"
                        />

                        {/* Sliding sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-screen w-64 bg-[#2C3E50] text-white flex flex-col z-[101] md:hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <div className="absolute top-4 right-4 z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="bg-white/10 hover:bg-white/20 text-white shadow-none"
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
