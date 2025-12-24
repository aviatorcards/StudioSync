import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export interface MessageUser {
    id: string;
    full_name: string;
    avatar: string | null;
}

export interface Message {
    id: string;
    sender: string;
    sender_details: MessageUser;
    body: string;
    created_at: string;
    read_by: string[]; // List of user IDs
}

export interface MessageThread {
    id: string;
    subject: string;
    participants_details: MessageUser[];
    last_message: Message | null;
    unread_count: number;
    updated_at: string;
}

export function useMessages() {
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);

    const fetchThreads = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/messaging/threads/');
            setThreads(res.data.results || res.data); // Handle pagination or list
        } catch (error) {
            console.error(error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (threadId: string) => {
        try {
            setMessagesLoading(true);
            const res = await api.get(`/messaging/threads/${threadId}/messages/`);
            setMessages(res.data);

            // Mark as read locally
            setThreads(prev => prev.map(t =>
                t.id === threadId ? { ...t, unread_count: 0 } : t
            ));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load conversation');
        } finally {
            setMessagesLoading(false);
        }
    }, []);

    const sendMessage = async (recipientIds: string[], subject: string, body: string) => {
        try {
            const res = await api.post('/messaging/threads/', {
                recipient_ids: recipientIds,
                subject,
                message: body
            });
            setThreads(prev => [res.data, ...prev]);
            return res.data;
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
            throw error;
        }
    };

    const replyToThread = async (threadId: string, body: string) => {
        try {
            const res = await api.post(`/messaging/threads/${threadId}/reply/`, { body });
            setMessages(prev => [...prev, res.data]);

            // Update thread list with new last message
            setThreads(prev => {
                const updated = prev.map(t =>
                    t.id === threadId
                        ? { ...t, last_message: res.data, updated_at: new Date().toISOString() }
                        : t
                );
                // Move updated thread to top
                updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                return updated;
            });

            return res.data;
        } catch (error) {
            console.error(error);
            toast.error('Failed to send reply');
            throw error;
        }
    };

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    // WebSocket Integration
    useEffect(() => {
        if (!activeThread?.id) return;

        // Construct WebSocket URL
        // From: http://localhost:8000/api -> ws://localhost:8000
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
            .replace('/api', '')
            .replace(/^http/, 'ws');

        const wsUrl = `${baseUrl}/ws/chat/${activeThread.id}/`;

        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
                const newMessage = data.data;
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === newMessage.id)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });

                // Also update thread list preview if needed
                setThreads(prev => {
                    const updated = prev.map(t =>
                        t.id === activeThread.id
                            ? { ...t, last_message: newMessage, updated_at: newMessage.created_at }
                            : t
                    );
                    updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                    return updated;
                });
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, [activeThread?.id]);

    return {
        threads,
        activeThread,
        setActiveThread,
        messages,
        loading,
        messagesLoading,
        fetchMessages,
        sendMessage,
        replyToThread,
        refreshThreads: fetchThreads
    };
}
