"use client";

import { useState, useMemo } from 'react';
import {
    Channel,
    ChannelHeader,
    ChannelList,
    MessageInput,
    MessageList,
    Thread,
    Window,
    useChatContext
} from 'stream-chat-react';
import { useUser } from '@/contexts/UserContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useUsers } from '@/hooks/useDashboardData';
import { Edit, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const MessagingCenter = () => {
    const { currentUser } = useUser();
    const { theme } = useAppearance();
    const { users: allUsers } = useUsers();
    const { client } = useChatContext();
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    if (!currentUser) return null;

    const isDark = theme === 'dark' || (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const filters = useMemo(() => ({
        type: 'messaging',
        members: { $in: [currentUser.id] }
    }), [currentUser.id]);

    const sort = useMemo(() => ({ last_message_at: -1 } as const), []);
    const options = useMemo(() => ({ state: true, watch: true, presence: true } as const), []);

    const handleCreateChannel = async (recipientId: string, body: string) => {
        if (!client) return;

        try {
            // No 'name' provided so Stream automatically uses the members' names for the channel title
            const channel = client.channel('messaging', {
                members: [currentUser.id, recipientId],
            });

            await channel.watch();

            // Send first message
            await channel.sendMessage({ text: body });

            setIsComposeOpen(false);
            toast.success('Message sent!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create conversation');
        }
    };

    return (
        <div className={`h-[calc(100vh-8rem)] flex rounded-xl border shadow-sm overflow-hidden str-chat ${isDark ? 'bg-[#1c1e22] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r h-full ${isDark ? 'bg-[#17191c] border-white/10' : 'bg-gray-50/50 border-gray-200'}`}>
                <div className={`p-4 border-b flex justify-between items-center shrink-0 ${isDark ? 'bg-[#17191c] border-white/10' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm hover:scale-110 active:scale-95"
                        title="New Message"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ChannelList
                        filters={filters}
                        sort={sort}
                        options={options}
                        // Using custom List component to keep the container styling
                        List={(listProps) => <div className="h-full">{listProps.children}</div>}
                    />
                </div>
            </div>

            <div className={`flex-1 flex flex-col h-full relative ${isDark ? 'bg-[#1c1e22]' : 'bg-white'}`}>
                <Channel>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput focus />
                    </Window>
                    <Thread />
                </Channel>
            </div>

            {isComposeOpen && (
                <ComposeModal
                    onClose={() => setIsComposeOpen(false)}
                    users={allUsers || []}
                    onSend={handleCreateChannel}
                    isDark={isDark}
                />
            )}
        </div>
    );
};

// Simplified modal for creating new Stream channels
function ComposeModal({ onClose, users, onSend, isDark }: { onClose: () => void, users: any[], onSend: (recipientId: string, body: string) => Promise<void>, isDark: boolean }) {
    const [recipientId, setRecipientId] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientId || !body) return;

        setSending(true);
        await onSend(recipientId, body);
        setSending(false);
    }

    return (
        <div className={`fixed inset-0 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-gray-900/60'}`}>
            <div className={`rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border ${isDark ? 'bg-[#1c1e22] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b flex justify-between items-center px-6 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Message</h3>
                    <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Send to:</label>
                        <select
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all ${isDark ? 'bg-[#17191c] border-white/10 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            required
                        >
                            <option value="">Choose a person...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name} ({u.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Message:</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all ${isDark ? 'bg-[#17191c] border-white/10 text-gray-200 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}
                            required
                            placeholder="Write your message here..."
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg mr-2 transition-colors ${isDark ? 'text-gray-300 bg-white/10 hover:bg-white/15' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            {sending ? 'Sending...' : 'Start Chat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
