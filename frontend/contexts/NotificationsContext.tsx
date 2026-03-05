'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    ReactNode,
} from 'react'
import api from '@/services/api'
import { useUser } from '@/contexts/UserContext'

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

interface NotificationsContextType {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    refetch: () => void
    markRead: (id: number) => Promise<void>
    markAllRead: () => Promise<void>
    clearAll: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    refetch: () => {},
    markRead: async () => {},
    markAllRead: async () => {},
    clearAll: async () => {},
})

function buildWsBase(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    let base = apiUrl.startsWith('http') ? apiUrl : `${typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'https' : 'http') : 'http'}://localhost:8000${apiUrl}`
    // Strip /api suffix and trailing slash, then swap http -> ws
    return base.replace(/\/api\/?$/, '').replace(/\/$/, '').replace(/^http/, 'ws')
}

export function NotificationsProvider({ children, pollInterval = 30000 }: { children: ReactNode; pollInterval?: number }) {
    const { currentUser } = useUser()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const pollingRef = useRef<any>(null)

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/notifications/recent/')
            const data: Notification[] = Array.isArray(response.data) ? response.data : response.data.results || []
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        } catch {
            // silently fail on background fetches
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/notifications/unread_count/')
            setUnreadCount(response.data.count ?? 0)
        } catch {
            // silent
        }
    }, [])

    // Initial fetch whenever user changes
    useEffect(() => {
        if (!currentUser?.id) return
        fetchNotifications()
    }, [currentUser?.id, fetchNotifications])

    // Polling fallback
    useEffect(() => {
        if (!currentUser?.id) return
        pollingRef.current = setInterval(refreshUnreadCount, pollInterval)
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [currentUser?.id, refreshUnreadCount, pollInterval])

    // ── WebSocket — single connection for the lifetime of the session ──────
    useEffect(() => {
        if (!currentUser?.id) return

        let socket: WebSocket | null = null
        let reconnectTimeout: any = null
        let retryDelay = 1000 // start at 1 s, double each attempt up to 30 s

        const connect = () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
            if (!token) {
                // Token not ready yet — retry quickly
                reconnectTimeout = setTimeout(connect, 500)
                return
            }

            const wsUrl = `${buildWsBase()}/ws/notifications/?token=${token}`
            socket = new WebSocket(wsUrl)

            socket.onopen = () => {
                retryDelay = 1000 // reset back-off on successful connect
            }

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === 'notification') {
                    setNotifications(prev => [data.data, ...prev].slice(0, 50))
                    setUnreadCount(prev => prev + 1)
                }
            }

            socket.onerror = () => {
                // Browser hides the real error; close event will trigger reconnect
            }

            socket.onclose = (e) => {
                socket = null
                if (!e.wasClean) {
                    retryDelay = Math.min(retryDelay * 2, 30000)
                    reconnectTimeout = setTimeout(connect, retryDelay)
                }
            }
        }

        connect()

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout)
            if (socket) { socket.onclose = null; socket.close() }
        }
    }, [currentUser?.id])

    // ── Mutations ──────────────────────────────────────────────────────────
    const markRead = useCallback(async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
        try { await api.post(`/notifications/${id}/mark_read/`) }
        catch { fetchNotifications() }
    }, [fetchNotifications])

    const markAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        try { await api.post('/notifications/mark_all_read/') }
        catch { fetchNotifications() }
    }, [fetchNotifications])

    const clearAll = useCallback(async () => {
        const previous = notifications
        setNotifications([])
        setUnreadCount(0)
        try { await api.delete('/notifications/clear_all/') }
        catch { setNotifications(previous); fetchNotifications() }
    }, [notifications, fetchNotifications])

    return (
        <NotificationsContext.Provider value={{
            notifications, unreadCount, loading,
            refetch: fetchNotifications, markRead, markAllRead, clearAll,
        }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotificationsContext() {
    return useContext(NotificationsContext)
}
