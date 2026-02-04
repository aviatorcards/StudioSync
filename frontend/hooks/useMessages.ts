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
            setThreads((prev: MessageThread[]) => prev.map(t =>
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
            setThreads((prev: MessageThread[]) => [res.data, ...prev]);
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
            setMessages((prev: Message[]) => [...prev, res.data]);

            // Update thread list with new last message
            setThreads((prev: MessageThread[]) => {
                const updated = prev.map((t: MessageThread) =>
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

        // Construct WebSocket URL safely
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        if (!baseUrl.startsWith('http')) {
            // It's a relative path or empty, use window location
            if (typeof window !== 'undefined') {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.hostname;
                // If we are on port 3000 (Next.js dev), use port 8000 (Django dev)
                const port = window.location.port === '3000' ? '8000' : window.location.port;
                baseUrl = `${protocol}//${host}${port ? `:${port}` : ''}${baseUrl}`;
            } else {
                baseUrl = 'ws://localhost:8000';
            }
        }

        const finalBase = baseUrl
            .replace('/api', '')
            .replace(/^http/, 'ws');

        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const wsUrl = `${finalBase}/ws/chat/${activeThread.id}/${token ? `?token=${token}` : ''}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            // WebSocket connection established
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message') {
                const newMessage = data.data;
                setMessages((prev: Message[]) => {
                    // Avoid duplicates
                    if (prev.some((m: Message) => m.id === newMessage.id)) {
                        return prev;
                    }
                    return [...prev, newMessage];
                });

                // Also update thread list preview if needed
                setThreads((prev: MessageThread[]) => {
                    const updated = prev.map((t: MessageThread) =>
                        t.id === activeThread.id
                            ? { ...t, last_message: newMessage, updated_at: newMessage.created_at }
                            : t
                    );
                    updated.sort((a: MessageThread, b: MessageThread) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                    return updated;
                });
            }
        };

        socket.onclose = () => {
            // WebSocket connection closed
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
