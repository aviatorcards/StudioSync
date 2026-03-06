'use client'

import { ChatProvider } from '@/components/messaging/ChatProvider'
import { MessagingCenter } from '@/components/messaging/MessagingCenter'

export default function MessagesPage() {
    return (
        <ChatProvider>
            <MessagingCenter />
        </ChatProvider>
    )
}

