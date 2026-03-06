"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { StreamChat } from "stream-chat";
import { Chat, useCreateChatClient } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useUser } from "@/contexts/UserContext";
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

    return (
        <Chat client={client}>
            {children}
        </Chat>
    );
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { currentUser: user } = useUser();
    const [token, setToken] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        let mounted = true;

        const fetchToken = async () => {
            try {
                const response = await api.get("/messaging/token/");
                if (mounted && response.data?.token && response.data?.apiKey) {
                    setToken(response.data.token);
                    setApiKey(response.data.apiKey);
                }
            } catch (err) {
                console.error("Failed to fetch Stream token", err);
            }
        };

        fetchToken();

        return () => {
            mounted = false;
        };
    }, [user]);

    if (!user || !token || !apiKey) {
        // Need a full page loader here since stream chat requires a token upfront
        return (
            <div className="flex w-full h-full items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return <ChatClientProvider user={user} token={token} apiKey={apiKey}>{children}</ChatClientProvider>;
};
