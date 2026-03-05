// This hook is a thin wrapper around NotificationsContext.
// The actual WebSocket + polling logic lives in NotificationsProvider
// (contexts/NotificationsContext.tsx) to ensure a single connection.
import { useNotificationsContext, type Notification } from '@/contexts/NotificationsContext'

export type { Notification }

export function useNotifications(_pollInterval?: number) {
    return useNotificationsContext()
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
