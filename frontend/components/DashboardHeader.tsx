'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, Bell, Search, LogOut, User, GraduationCap, FileText, BookOpen, Menu } from 'lucide-react'
import { Logo } from '@/components/Logo'
import api from '@/services/api'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

interface Notification {
    id: string
    title: string
    message: string
    time: string
    read: boolean
    type?: 'welcome' | 'system' | 'student' | 'lesson' | 'payment' | 'message'
    link?: string
}

interface DashboardHeaderProps {
    onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const { currentUser, logout, setCurrentUser } = useUser()
    const router = useRouter()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationRef = useRef<HTMLDivElement>(null)

    // Load notifications from user preferences or use defaults
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const savedNotifications = currentUser?.preferences?.notifications_list
        if (savedNotifications && Array.isArray(savedNotifications)) {
            return savedNotifications
        }
        return [
            {
                id: '1',
                title: 'Welcome to StudioSync!',
                message: 'Your dashboard is ready. Try adding your first student.',
                time: '2 mins ago',
                read: false,
                type: 'welcome',
                link: '/dashboard/students'
            },
            {
                id: '2',
                title: 'System Update',
                message: 'New themes are now available in Settings.',
                time: '1 hour ago',
                read: false,
                type: 'system',
                link: '/dashboard/settings'
            }
        ]
    })

    // Close dropdowns on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowNotifications(false)
                setShowUserMenu(false)
            }
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [])

    // Close notification dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

    const saveNotificationsToBackend = async (updatedNotifications: Notification[]) => {
        try {
            const response = await api.patch('/core/users/me/', {
                preferences: {
                    ...currentUser?.preferences,
                    notifications_list: updatedNotifications
                }
            })
            setCurrentUser(response.data)
        } catch (error) {
            console.error('Failed to save notification status:', error)
        }
    }

    const markAllAsRead = async () => {
        const updatedNotifications = notifications.map((n: Notification) => ({ ...n, read: true }))
        setNotifications(updatedNotifications)
        await saveNotificationsToBackend(updatedNotifications)
        toast.success('All notifications marked as read')
    }

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        const updatedNotifications = notifications.map((n: Notification) =>
            n.id === notification.id ? { ...n, read: true } : n
        )
        setNotifications(updatedNotifications)
        await saveNotificationsToBackend(updatedNotifications)

        // Close dropdown
        setShowNotifications(false)

        // Navigate to link if provided
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const unreadCount = notifications.filter((n: Notification) => !n.read).length

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="md:hidden mr-2 text-gray-600"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </Button>

                {/* Left: Page Title */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
                    <p className="text-xs md:text-sm text-gray-500 truncate">Welcome back, {currentUser?.full_name}</p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 md:space-x-3">
                    {/* Utility Icons */}
                    <div className="flex items-center space-x-1 md:space-x-2">
                        <div className="relative" ref={notificationRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-500"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 antialiased">
                                    <div className="p-3 border-b flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-semibold text-sm">Notifications</h3>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={markAllAsRead}
                                            className="h-auto p-0 text-xs text-primary hover:underline cursor-pointer shadow-none"
                                        >
                                            Mark all read
                                        </Button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className="p-3 hover:bg-gray-50 border-b cursor-pointer transition-colors"
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-2 h-2 mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'} rounded-full flex-shrink-0`} />
                                                    <div>
                                                        <p className={`text-sm ${notification.read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t text-center">
                                        <Link href="/dashboard/settings" className="text-xs text-gray-500 hover:text-gray-900">
                                            View notification settings
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg text-gray-500 w-9 h-9 items-center justify-center">
                            {/* @ts-ignore */}
                            <google-cast-launcher style={{ width: '20px', height: '20px', opacity: 0.6 }}></google-cast-launcher>
                        </div>

                        <Button variant="ghost" size="icon" className="hidden sm:block text-gray-500">
                            <Search className="w-5 h-5" />
                        </Button>

                        <Link href="/dashboard/settings" className="hidden sm:block">
                            <Button variant="ghost" size="icon" className="text-gray-500">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* User Menu */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 h-auto p-2 hover:bg-gray-100 rounded-lg group transition-colors"
                            >
                                {currentUser?.avatar ? (
                                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-gray-300 transition-all">
                                        <img
                                            src={currentUser.avatar}
                                            alt={currentUser.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm group-hover:shadow-md transition-shadow">
                                        {currentUser?.initials}
                                    </div>
                                )}
                                <div className="text-left hidden md:block">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{currentUser?.full_name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 capitalize">{currentUser?.role === 'teacher' ? 'Instructor' : currentUser?.role}</span>
                                </div>
                                <div className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                                    ▼
                                </div>
                            </Button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-black/5 antialiased">
                                        {/* User Info */}
                                        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.email}</p>
                                        </div>

                                        {/* Quick Access */}
                                        <div className="p-2 border-b border-gray-100">
                                            <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Access</p>
                                            <Link
                                                href="/dashboard/lessons"
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100 transition-colors">
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <span>My Lessons</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/students"
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 bg-pink-50 text-pink-600 rounded-md group-hover:bg-pink-100 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span>My Students</span>
                                            </Link>
                                        </div>

                                        {/* Knowledge Base */}
                                        <div className="p-2 border-b border-gray-100">
                                            <Link
                                                href="/dashboard/resources"
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-800 bg-amber-50/50 hover:bg-amber-50 rounded-lg transition-colors group border border-amber-100/50 hover:border-amber-200"
                                            >
                                                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-200 transition-colors shadow-sm">
                                                    <GraduationCap className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="block text-amber-900">Learning Base</span>
                                                    <span className="text-[10px] text-amber-700/70 font-normal">Explore resources & guides</span>
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Account Settings */}
                                        <div className="p-2 border-b border-gray-100">
                                            <p className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>

                                            <Link
                                                href="/dashboard/settings"
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-gray-400" />
                                                <span>Settings</span>
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="p-2 bg-gray-50/50">
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowUserMenu(false)
                                                    logout()
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all group border border-transparent hover:border-red-100 h-auto"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Log Out</span>
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
