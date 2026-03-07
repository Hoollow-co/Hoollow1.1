"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ArrowLeft, Check, X, UserPlus, Inbox, Search, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { showToast } from "@/store";

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

interface SearchUser {
    id: string;
    name: string;
    image: string;
    role: string;
    impactXP: number;
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
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [userSearchResults, setUserSearchResults] = useState<SearchUser[]>([]);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/dm");
            if (res.ok) setConversations(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchPendingRequests = useCallback(async () => {
        try {
            const res = await fetch("/api/dm/requests");
            if (res.ok) setPendingRequests(await res.json());
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
        fetchPendingRequests();
    }, [fetchConversations, fetchPendingRequests]);

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
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to send message");
            }
        } catch (e) {
            showToast("error", "Network error — couldn't send message");
        }
        finally { setSending(false); }
    };

    const handleAcceptRequest = async (requestId: string) => {
        setProcessingRequestId(requestId);
        try {
            await fetch("/api/dm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: "accepted" }),
            });
            showToast("success", "Message request accepted!");
            fetchConversations();
            fetchPendingRequests();
        } catch (e) {
            showToast("error", "Failed to accept request");
        } finally {
            setProcessingRequestId(null);
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        setProcessingRequestId(requestId);
        try {
            await fetch("/api/dm", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: "rejected" }),
            });
            showToast("info", "Message request declined");
            fetchPendingRequests();
        } catch (e) {
            showToast("error", "Failed to decline request");
        } finally {
            setProcessingRequestId(null);
        }
    };

    const openChat = (userId: string, user: Conversation["user"]) => {
        setActiveChat(userId);
        setActiveChatUser(user);
    };

    // Search users for new chat
    const handleSearchUsers = async (query: string) => {
        setUserSearchQuery(query);
        if (query.length < 2) { setUserSearchResults([]); return; }
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const results = await res.json();
                // Filter out existing conversations and self
                const existingUserIds = new Set(conversations.map((c) => c.user.id));
                setUserSearchResults(
                    results.filter((u: SearchUser) => u.id !== session?.user?.id && !existingUserIds.has(u.id))
                );
            }
        } catch (e) { console.error(e); }
    };

    const handleSendMessageRequest = async (toUserId: string) => {
        setSendingRequest(true);
        try {
            const res = await fetch("/api/dm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "request", toUserId }),
            });
            if (res.ok) {
                showToast("success", "Message request sent!");
                setShowNewChatModal(false);
                setUserSearchQuery("");
                setUserSearchResults([]);
            } else {
                const data = await res.json();
                if (res.status === 409 && data.status === "accepted") {
                    // Already connected — just open the chat
                    showToast("info", "You're already connected! Opening chat...");
                    setShowNewChatModal(false);
                    fetchConversations();
                } else {
                    showToast("error", data.error || "Failed to send request");
                }
            }
        } catch (e) {
            showToast("error", "Network error");
        }
        finally { setSendingRequest(false); }
    };

    // Filter conversations by search
    const filteredConversations = conversations.filter(
        (conv) =>
            !searchQuery ||
            conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-bold text-text-primary font-display flex items-center gap-2">
                                            <MessageCircle size={20} /> Messages
                                        </h2>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowNewChatModal(true)}
                                            className="w-8 h-8 bg-accent text-accent-inverse rounded-full flex items-center justify-center hover:bg-accent-hover transition-colors"
                                            title="New Chat"
                                        >
                                            <Plus size={16} />
                                        </motion.button>
                                    </div>
                                    {/* Search bar */}
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Search conversations..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-surface-alt border border-border rounded-pill text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Pending DM Requests */}
                                {pendingRequests.length > 0 && (
                                    <div className="border-b border-border">
                                        <div className="px-4 py-2 flex items-center gap-2">
                                            <UserPlus size={14} className="text-orange-500" />
                                            <span className="text-label font-semibold text-text-primary uppercase tracking-wider">Requests</span>
                                            <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-pill">
                                                {pendingRequests.length}
                                            </span>
                                        </div>
                                        {pendingRequests.map((req) => (
                                            <div key={req.id} className="px-4 py-3 border-t border-border/50 bg-orange-50/30">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar name={req.fromUser.name} image={req.fromUser.image} size="sm" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-small font-medium text-text-primary truncate">{req.fromUser.name}</p>
                                                        <p className="text-label text-text-muted">wants to message you</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 ml-9">
                                                    <button
                                                        onClick={() => handleAcceptRequest(req.id)}
                                                        disabled={processingRequestId === req.id}
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-btn text-label font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                                                    >
                                                        <Check size={12} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRequest(req.id)}
                                                        disabled={processingRequestId === req.id}
                                                        className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 rounded-btn text-label font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    >
                                                        <X size={12} /> Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Conversation List */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-16">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                                        </div>
                                    ) : filteredConversations.length === 0 ? (
                                        <div className="text-center py-16 px-4">
                                            <Inbox size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
                                            <p className="text-small text-text-muted">
                                                {searchQuery ? "No conversations match your search" : "No conversations yet"}
                                            </p>
                                            {!searchQuery && (
                                                <button
                                                    onClick={() => setShowNewChatModal(true)}
                                                    className="text-label text-accent font-semibold mt-2 hover:underline"
                                                >
                                                    Start a new conversation
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        filteredConversations.map((conv) => (
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

            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowNewChatModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-surface rounded-card p-6 max-w-md w-full shadow-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-semibold text-text-primary flex items-center gap-2">
                                    <UserPlus size={18} /> New Conversation
                                </h2>
                                <button onClick={() => setShowNewChatModal(false)} className="text-text-muted hover:text-text-primary">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-small text-text-muted mb-4">
                                Search for a user to send a message request.
                            </p>
                            <div className="relative mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    value={userSearchQuery}
                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                    placeholder="Search by name..."
                                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                                {userSearchResults.length === 0 && userSearchQuery.length >= 2 && (
                                    <p className="text-center py-4 text-small text-text-muted">No users found</p>
                                )}
                                {userSearchResults.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleSendMessageRequest(u.id)}
                                        disabled={sendingRequest}
                                        className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-surface-alt transition-colors text-left"
                                    >
                                        <Avatar name={u.name} image={u.image} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-small font-medium text-text-primary truncate">{u.name}</p>
                                            <p className="text-label text-text-muted capitalize">{u.role} · {u.impactXP} XP</p>
                                        </div>
                                        <span className="text-label text-accent font-semibold flex-shrink-0">Send Request</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
