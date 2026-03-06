"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ArrowLeft, Check, X, UserPlus, Inbox } from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";

interface Conversation {
    requestId: string;
    user: { id: string; name: string; image: string; role: string };
    lastMessage: { text: string; createdAt: string } | null;
}

interface MessageRequest {
    id: string;
    status: string;
    fromUser: { id: string; name: string; image: string };
    createdAt: string;
}

interface DM {
    id: string;
    text: string;
    createdAt: string;
    fromUser: { id: string; name: string; image: string };
}

export default function MessagesPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [pendingRequests, setPendingRequests] = useState<MessageRequest[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [activeChatUser, setActiveChatUser] = useState<Conversation["user"] | null>(null);
    const [messages, setMessages] = useState<DM[]>([]);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [tab, setTab] = useState<"chats" | "requests">("chats");
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/dm");
            if (res.ok) setConversations(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchPendingRequests = useCallback(async () => {
        try {
            // Fetch pending requests from notifications or DM endpoint
            const res = await fetch("/api/dm");
            if (res.ok) {
                // We'll also look for pending requests in the dm endpoint
                // For now - get from conversations
            }
        } catch (e) { console.error(e); }
    }, []);

    const fetchMessages = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`/api/dm/${userId}`);
            if (res.ok) setMessages(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat);
            pollRef.current = setInterval(() => fetchMessages(activeChat), 3000);
            return () => { if (pollRef.current) clearInterval(pollRef.current); };
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [activeChat, fetchMessages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!messageText.trim() || !activeChat) return;
        setSending(true);
        try {
            const res = await fetch("/api/dm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "send", toUserId: activeChat, text: messageText }),
            });
            if (res.ok) {
                const msg = await res.json();
                setMessages((prev) => [...prev, msg]);
                setMessageText("");
            }
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await fetch("/api/dm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: "accepted" }),
            });
            fetchConversations();
        } catch (e) { console.error(e); }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await fetch("/api/dm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: "rejected" }),
            });
            fetchConversations();
        } catch (e) { console.error(e); }
    };

    const openChat = (userId: string, user: Conversation["user"]) => {
        setActiveChat(userId);
        setActiveChatUser(user);
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-20">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-surface border border-border rounded-card overflow-hidden" style={{ height: "calc(100vh - 160px)", minHeight: "500px" }}>
                        <div className="flex h-full">
                            {/* Sidebar */}
                            <div className={`w-80 border-r border-border flex flex-col ${activeChat ? "hidden md:flex" : "flex w-full md:w-80"}`}>
                                <div className="p-4 border-b border-border">
                                    <h2 className="text-lg font-bold text-text-primary font-display flex items-center gap-2">
                                        <MessageCircle size={20} /> Messages
                                    </h2>
                                </div>

                                {/* Conversation List */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-16">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="text-center py-16 px-4">
                                            <Inbox size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
                                            <p className="text-small text-text-muted">No conversations yet</p>
                                            <p className="text-label text-text-muted mt-1">Send a message request from someone&apos;s profile</p>
                                        </div>
                                    ) : (
                                        conversations.map((conv) => (
                                            <motion.button
                                                key={conv.requestId}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => openChat(conv.user.id, conv.user)}
                                                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-surface-alt transition-colors border-b border-border/50 ${activeChat === conv.user.id ? "bg-surface-alt" : ""}`}
                                            >
                                                <Avatar name={conv.user.name} image={conv.user.image} size="md" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-small font-semibold text-text-primary truncate">{conv.user.name}</p>
                                                    {conv.lastMessage && (
                                                        <p className="text-label text-text-muted truncate">{conv.lastMessage.text}</p>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
                                {!activeChat ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <MessageCircle size={48} className="text-text-muted mx-auto mb-3 opacity-20" />
                                            <p className="text-text-muted">Select a conversation</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Chat Header */}
                                        <div className="flex items-center gap-3 p-4 border-b border-border">
                                            <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 rounded-btn hover:bg-surface-alt transition-colors">
                                                <ArrowLeft size={18} />
                                            </button>
                                            <Avatar name={activeChatUser?.name || ""} image={activeChatUser?.image} size="sm" />
                                            <div>
                                                <p className="text-small font-semibold text-text-primary">{activeChatUser?.name}</p>
                                                <p className="text-label text-text-muted capitalize">{activeChatUser?.role}</p>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {messages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <p className="text-text-muted text-small">Send the first message!</p>
                                                </div>
                                            ) : (
                                                messages.map((msg) => {
                                                    const isMe = msg.fromUser.id === session?.user?.id;
                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                                        >
                                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-small ${isMe
                                                                ? "bg-accent text-accent-inverse rounded-br-md"
                                                                : "bg-surface-alt text-text-primary rounded-bl-md"
                                                                }`}>
                                                                {msg.text}
                                                                <p className={`text-[10px] mt-1 ${isMe ? "text-accent-inverse/60" : "text-text-muted"}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Input */}
                                        <div className="p-3 border-t border-border">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={messageText}
                                                    onChange={(e) => setMessageText(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                                    placeholder="Type a message..."
                                                    className="flex-1 px-4 py-2.5 bg-surface-alt border border-border rounded-pill text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                                />
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSend}
                                                    disabled={!messageText.trim() || sending}
                                                    className="w-10 h-10 bg-accent text-accent-inverse rounded-full flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50"
                                                >
                                                    <Send size={16} />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
