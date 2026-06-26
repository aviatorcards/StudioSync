"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { Chat, useCreateChatClient } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useUser } from "@/contexts/UserContext";
import { useAppearance } from "@/contexts/AppearanceContext";
import api from "@/services/api";

type ChatProviderProps = {
    children: ReactNode;
};

type ChatClientProviderProps = {
    children: ReactNode;
    user: any;
    token: string;
    apiKey: string;
};

const ChatClientProvider: React.FC<ChatClientProviderProps> = ({ children, user, token, apiKey }) => {
    const { theme } = useAppearance();
    const client = useCreateChatClient({
        apiKey: apiKey,
        tokenOrProvider: token,
        userData: {
            id: user.id || "unknown",
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || 'User',
            image: user.avatar,
        }
    });

    if (!client) {
        return (
            <div className="flex w-full h-full items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const isDark = theme === 'dark' || (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const streamTheme = isDark ? 'str-chat__theme-dark' : 'str-chat__theme-light';

    return (
        <Chat client={client} theme={streamTheme}>
            {children}
        </Chat>
    );
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { currentUser: user } = useUser();
    const [token, setToken] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        let mounted = true;

        const fetchToken = async () => {
            try {
                const response = await api.get("/messaging/token/");
                if (mounted && response.data?.token && response.data?.apiKey) {
                    setToken(response.data.token);
                    setApiKey(response.data.apiKey);
                } else if (mounted) {
                    setError("Messaging service returned an invalid response.");
                }
            } catch (err: any) {
                if (mounted) {
                    const msg = err?.response?.data?.error || "Messaging service is not configured.";
                    setError(msg);
                    console.error("Failed to fetch Stream token", err);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchToken();

        return () => {
            mounted = false;
        };
    }, [user]);

    if (!user || loading) {
        return (
            <div className="flex w-full h-full items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !token || !apiKey) {
        return (
            <div className="flex w-full h-full items-center justify-center p-8">
                <div className="text-center max-w-sm">
                    <p className="text-gray-500 text-sm">{error || "Messaging is unavailable."}</p>
                    <p className="text-gray-400 text-xs mt-2">
                        Set <code className="bg-gray-100 px-1 rounded">STREAM_API_KEY</code> and{" "}
                        <code className="bg-gray-100 px-1 rounded">STREAM_API_SECRET</code> to enable messaging.
                    </p>
                </div>
            </div>
        );
    }

    return <ChatClientProvider user={user} token={token} apiKey={apiKey}>{children}</ChatClientProvider>;
};
