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
import { useUsers } from '@/hooks/useDashboardData';
import { Edit, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const MessagingCenter = () => {
    const { currentUser } = useUser();
    const { users: allUsers } = useUsers();
    const { client } = useChatContext();
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    if (!currentUser) return null;

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
        <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden str-chat">
            <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 h-full bg-gray-50/50">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
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

            <div className="flex-1 flex flex-col h-full bg-white relative">
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
                />
            )}
        </div>
    );
};

// Simplified modal for creating new Stream channels
function ComposeModal({ onClose, users, onSend }: { onClose: () => void, users: any[], onSend: (recipientId: string, body: string) => Promise<void> }) {
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-white px-6">
                    <h3 className="text-xl font-bold text-gray-900">New Message</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Send to:</label>
                        <select
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
                            {sending ? 'Sending...' : 'Start Chat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
