import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/services/api'

export interface Notification {
    id: number
    notification_type: string
    title: string
    message: string
    link: string | null
    read: boolean
    read_at: string | null
    created_at: string
    time_ago: string
    related_lesson_id: number | null
    related_student_id: number | null
    related_message_id: number | null
    related_document_id: number | null
}

export function useNotifications(pollInterval = 30000) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/notifications/recent/')
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || []
            setNotifications(data)
            setUnreadCount(data.filter((n: Notification) => !n.read).length)
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/notifications/unread_count/')
            setUnreadCount(response.data.count ?? 0)
        } catch (err) {
            // Silent fail for background polls
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Poll unread count every pollInterval ms
    useEffect(() => {
        pollingRef.current = setInterval(refreshUnreadCount, pollInterval)
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [refreshUnreadCount, pollInterval])

    const markRead = useCallback(async (id: number) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        try {
            await api.post(`/notifications/${id}/mark_read/`)
        } catch (err) {
            // Revert on failure
            fetchNotifications()
        }
    }, [fetchNotifications])

    const markAllRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        try {
            await api.post('/notifications/mark_all_read/')
        } catch (err) {
            fetchNotifications()
        }
    }, [fetchNotifications])

    const clearAll = useCallback(async () => {
        const previous = notifications
        setNotifications([])
        setUnreadCount(0)
        try {
            await api.delete('/notifications/clear_all/')
        } catch (err) {
            setNotifications(previous)
            fetchNotifications()
        }
    }, [notifications, fetchNotifications])

    return {
        notifications,
        unreadCount,
        loading,
        refetch: fetchNotifications,
        markRead,
        markAllRead,
        clearAll,
    }
}

// Map notification_type to a human-readable icon label used by consumers
export const NOTIFICATION_TYPE_META: Record<string, { emoji: string; color: string }> = {
    welcome: { emoji: '👋', color: 'bg-purple-100 text-purple-600' },
    lesson_scheduled: { emoji: '📅', color: 'bg-blue-100 text-blue-600' },
    lesson_reminder: { emoji: '⏰', color: 'bg-yellow-100 text-yellow-700' },
    lesson_cancelled: { emoji: '❌', color: 'bg-red-100 text-red-600' },
    new_student: { emoji: '🎓', color: 'bg-green-100 text-green-700' },
    new_message: { emoji: '💬', color: 'bg-indigo-100 text-indigo-600' },
    payment_received: { emoji: '💰', color: 'bg-emerald-100 text-emerald-700' },
    payment_due: { emoji: '🧾', color: 'bg-orange-100 text-orange-700' },
    document_pending: { emoji: '📋', color: 'bg-amber-100 text-amber-700' },
    document_signed: { emoji: '✅', color: 'bg-teal-100 text-teal-700' },
    system_update: { emoji: '🔔', color: 'bg-gray-100 text-gray-600' },
    inventory_request: { emoji: '📦', color: 'bg-cyan-100 text-cyan-700' },
    practice_room_reserved: { emoji: '🎸', color: 'bg-pink-100 text-pink-700' },
}
