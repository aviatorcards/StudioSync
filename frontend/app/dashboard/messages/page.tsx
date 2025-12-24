'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Edit, Send, User as UserIcon, MoreHorizontal, X } from 'lucide-react'
import { useMessages, MessageThread, Message } from '@/hooks/useMessages'
import { useUser } from '@/contexts/UserContext'
import { useUsers } from '@/hooks/useDashboardData'
import { toast } from 'react-hot-toast'

// Helper to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 3600 * 24);

    if (days < 1) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
    const { currentUser } = useUser();
    const {
        threads,
        activeThread,
        setActiveThread,
        messages,
        loading,
        messagesLoading,
        fetchMessages,
        sendMessage,
        replyToThread
    } = useMessages();
    const { users: allUsers } = useUsers(); // For User Select

    const [replyText, setReplyText] = useState('')
    const [isComposeOpen, setIsComposeOpen] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load messages when thread activated
    useEffect(() => {
        if (activeThread) {
            fetchMessages(activeThread.id);
        }
    }, [activeThread, fetchMessages]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeThread) return;

        await replyToThread(activeThread.id, replyText);
        setReplyText('');
    };

    const getOtherParticipant = (thread: MessageThread) => {
        return thread.participants_details.find(p => p.id !== currentUser?.id) || thread.participants_details[0];
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex bg-white rounded-lg border overflow-hidden">
            {/* Thread List Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r ${activeThread ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                        title="New Message"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : threads.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No messages yet.</p>
                            <button onClick={() => setIsComposeOpen(true)} className="text-primary mt-2 hover:underline">Start a conversation</button>
                        </div>
                    ) : (
                        threads.map(thread => {
                            const other = getOtherParticipant(thread);
                            const isActive = activeThread?.id === thread.id;
                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => setActiveThread(thread)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b last:border-0 ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-semibold text-gray-900 truncate pr-2">
                                            {other?.full_name || 'Unknown'}
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(thread.updated_at)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-800 font-medium truncate mb-0.5">
                                        {thread.subject || '(No Subject)'}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500 truncate max-w-[80%]">
                                            {thread.last_message?.body || 'No messages'}
                                        </div>
                                        {thread.unread_count > 0 && (
                                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {thread.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Conversation Area */}
            {activeThread ? (
                <div className={`flex-1 flex flex-col ${!activeThread ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
                        <div className="flex items-center space-x-3">
                            {/* Mobile Back Button */}
                            <button
                                onClick={() => setActiveThread(null)}
                                className="md:hidden mr-2 text-gray-600"
                            >
                                ←
                            </button>

                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                                {getOtherParticipant(activeThread)?.avatar ? (
                                    <img src={getOtherParticipant(activeThread).avatar!} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{getOtherParticipant(activeThread)?.full_name}</h2>
                                <p className="text-xs text-gray-500">{activeThread.subject}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messagesLoading ? (
                            <div className="flex justify-center p-4"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                            ? 'bg-primary text-white rounded-br-none shadow-md'
                                            : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                                {formatDate(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendReply} className="p-4 bg-white border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-transform active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Send className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                    <p>Select a conversation to start chatting.</p>
                </div>
            )}

            {/* Compose Modal */}
            {isComposeOpen && (
                <ComposeModal
                    onClose={() => setIsComposeOpen(false)}
                    users={allUsers || []}
                    onSend={sendMessage}
                />
            )}
        </div>
    )
}

function ComposeModal({ onClose, users, onSend }: { onClose: () => void, users: any[], onSend: (recipients: string[], subject: string, body: string) => Promise<any> }) {
    const [recipientId, setRecipientId] = useState('')
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientId || !body) return;

        setSending(true);
        try {
            await onSend([recipientId], subject || 'New Message', body);
            toast.success('Message sent');
            onClose();
        } catch (err) {
            // Error handled in hook
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 antialiased">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-black/5">
                <div className="p-4 border-b flex justify-between items-center bg-[#2C3E50] text-white ring-1 ring-white/10 px-8 py-6">
                    <h3 className="text-2xl font-black tracking-tight">New Message</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all group">
                        <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                        <select
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        >
                            <option value="">Select a recipient...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name} ({u.role})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Optional"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                            placeholder="Write your message here..."
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
