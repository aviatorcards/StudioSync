'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Settings, Bell, Search, LogOut, GraduationCap, FileText, BookOpen, Menu } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { useNotifications, NOTIFICATION_TYPE_META } from '@/hooks/useNotifications'

interface DashboardHeaderProps {
    onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const { currentUser, logout } = useUser()
    const router = useRouter()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationRef = useRef<HTMLDivElement>(null)

    const {
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        clearAll,
    } = useNotifications(30000)

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

    const handleMarkAllRead = async () => {
        await markAllRead()
        toast.success('All notifications marked as read')
    }

    const handleClearAll = async () => {
        await clearAll()
        toast.success('All notifications cleared')
    }

    const handleNotificationClick = async (notification: typeof notifications[0]) => {
        if (!notification.read) {
            await markRead(notification.id)
        }
        setShowNotifications(false)
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const getTypeMeta = (type: string) => {
        return NOTIFICATION_TYPE_META[type] ?? NOTIFICATION_TYPE_META['system_update']
    }

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
                    <div className="flex items-center space-x-1 md:space-x-2">

                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-500"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                        {unreadCount > 9 && (
                                            <span className="text-white text-[7px] font-black leading-none px-0.5">{unreadCount > 99 ? '99+' : unreadCount}</span>
                                        )}
                                    </span>
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-96 bg-white border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 overflow-hidden">
                                    {/* Header */}
                                    <div className="p-3 border-b flex justify-between items-center bg-gray-50/70">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={handleMarkAllRead}
                                                    className="h-auto p-0 text-xs text-primary hover:underline cursor-pointer shadow-none"
                                                >
                                                    Mark all read
                                                </Button>
                                            )}
                                            {unreadCount > 0 && <span className="text-gray-300">|</span>}
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={handleClearAll}
                                                className="h-auto p-0 text-xs text-gray-500 hover:text-red-600 hover:underline cursor-pointer shadow-none"
                                            >
                                                Clear all
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Notification List */}
                                    <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔔</div>
                                                <p className="text-sm font-medium text-gray-500">You're all caught up!</p>
                                                <p className="text-xs text-gray-400">No notifications yet.</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 10).map((notification) => {
                                                const meta = getTypeMeta(notification.notification_type)
                                                return (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        {/* Icon */}
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${meta.color}`}>
                                                            {meta.emoji}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-1">
                                                                <p className={`text-sm leading-tight truncate ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                                    {notification.title}
                                                                </p>
                                                                {!notification.read && (
                                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-medium">{notification.time_ago}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="p-2.5 border-t bg-gray-50/50 text-center">
                                        <Link
                                            href="/dashboard/notifications"
                                            onClick={() => setShowNotifications(false)}
                                            className="text-xs font-semibold text-primary hover:underline"
                                        >
                                            View all notifications →
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
