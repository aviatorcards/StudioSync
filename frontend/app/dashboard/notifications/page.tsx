'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Trash2, Filter, Loader2, ExternalLink } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPE_META, type Notification } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

type FilterType = 'all' | 'unread' | string

const TYPE_LABELS: Record<string, string> = {
    welcome: 'Welcome',
    lesson_scheduled: 'Lesson Scheduled',
    lesson_reminder: 'Lesson Reminder',
    lesson_cancelled: 'Lesson Cancelled',
    new_student: 'New Student',
    new_message: 'New Message',
    payment_received: 'Payment',
    payment_due: 'Payment Due',
    document_pending: 'Document',
    document_signed: 'Document Signed',
    system_update: 'System',
    inventory_request: 'Inventory',
    practice_room_reserved: 'Room Reserved',
}

const FILTER_GROUPS: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Lessons', value: 'lesson_scheduled' },
    { label: 'Messages', value: 'new_message' },
    { label: 'Payments', value: 'payment_received' },
    { label: 'System', value: 'system_update' },
]

export default function NotificationsPage() {
    const router = useRouter()
    const { notifications, unreadCount, loading, markRead, markAllRead, clearAll, refetch } = useNotifications()
    const [filter, setFilter] = useState<FilterType>('all')

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'all') return true
        if (filter === 'unread') return !n.read
        // Group similar types (payment_received + payment_due both under 'payment_received')
        if (filter === 'lesson_scheduled') return n.notification_type.startsWith('lesson_')
        if (filter === 'payment_received') return n.notification_type.startsWith('payment_')
        return n.notification_type === filter
    })

    const handleMarkAllRead = async () => {
        await markAllRead()
        toast.success('All notifications marked as read')
    }

    const handleClearAll = async () => {
        if (!confirm('Clear all notifications? This cannot be undone.')) return
        await clearAll()
        toast.success('Notifications cleared')
    }

    const handleClick = async (n: Notification) => {
        if (!n.read) await markRead(n.id)
        if (n.link) router.push(n.link)
    }

    const getTypeMeta = (type: string) =>
        NOTIFICATION_TYPE_META[type] ?? NOTIFICATION_TYPE_META['system_update']

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    // Group notifications by date (Today, Yesterday, Older)
    const groupByDate = (items: Notification[]) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today.getTime() - 86400000)

        const groups: { label: string; items: Notification[] }[] = [
            { label: 'Today', items: [] },
            { label: 'Yesterday', items: [] },
            { label: 'Older', items: [] },
        ]

        items.forEach((n) => {
            const d = new Date(n.created_at)
            const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
            if (day >= today) groups[0].items.push(n)
            else if (day >= yesterday) groups[1].items.push(n)
            else groups[2].items.push(n)
        })

        return groups.filter((g) => g.items.length > 0)
    }

    const grouped = groupByDate(filteredNotifications)

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Stay up to date with your studio activity</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="gap-2 text-xs"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            className="gap-2 text-xs text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear all
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_GROUPS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                            filter === f.value
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                        }`}
                    >
                        {f.label}
                        {f.value === 'unread' && unreadCount > 0 && (
                            <span className={`text-[10px] font-black px-1 rounded ${filter === 'unread' ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
                </div>
            ) : grouped.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                        🔔
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {filter === 'unread'
                            ? 'You have no unread notifications.'
                            : filter === 'all'
                            ? "When things happen in your studio, you'll see them here."
                            : 'No notifications in this category.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((group) => (
                        <div key={group.label}>
                            {/* Date header */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{group.label}</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            {/* Notification cards */}
                            <div className="space-y-2">
                                {group.items.map((n) => {
                                    const meta = getTypeMeta(n.notification_type)
                                    const typeLabel = TYPE_LABELS[n.notification_type] ?? n.notification_type

                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleClick(n)}
                                            className={`
                                                group relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer
                                                ${!n.read
                                                    ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70 hover:border-blue-200'
                                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                                }
                                            `}
                                        >
                                            {/* Unread indicator */}
                                            {!n.read && (
                                                <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                                            )}

                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${meta.color}`}>
                                                {meta.emoji}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className={`text-sm leading-snug ${!n.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                                            {n.title}
                                                        </p>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.color}`}>
                                                            {typeLabel}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[11px] text-gray-400 font-medium">{n.time_ago}</span>
                                                    <span className="text-[11px] text-gray-300">•</span>
                                                    <span className="text-[11px] text-gray-400">{formatDate(n.created_at)}</span>
                                                    {n.link && (
                                                        <span className="text-[11px] text-primary font-semibold flex items-center gap-0.5 group-hover:underline">
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer summary */}
            {!loading && notifications.length > 0 && (
                <p className="text-center text-xs text-gray-400 pb-4">
                    Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                    {filter !== 'all' && ` · ${filter === 'unread' ? 'unread only' : FILTER_GROUPS.find(f => f.value === filter)?.label ?? filter}`}
                </p>
            )}
        </div>
    )
}
