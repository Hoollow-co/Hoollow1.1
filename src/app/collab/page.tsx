"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Inbox,
    Send,
    Check,
    X,
    ArrowRight,
    MessageCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { showToast } from "@/store";

interface CollabUser {
    id: string;
    name: string;
    image: string;
    role: string;
}

interface CollabRequest {
    id: string;
    message: string | null;
    status: string;
    post: { id: string; title: string } | null;
    project: { id: string; name: string } | null;
    fromUser?: CollabUser;
    toUser?: CollabUser;
    createdAt: string;
}

const tabs = ["Incoming", "Outgoing", "Active"] as const;
type TabType = (typeof tabs)[number];

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    pending: { icon: <Clock size={14} />, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
    accepted: { icon: <CheckCircle2 size={14} />, color: "text-green-600", bg: "bg-green-50", label: "Accepted" },
    rejected: { icon: <XCircle size={14} />, color: "text-red-500", bg: "bg-red-50", label: "Rejected" },
};

function getTimeAgo(date: string) {
    const ms = Date.now() - new Date(date).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function CollabPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<TabType>("Incoming");
    const [sent, setSent] = useState<CollabRequest[]>([]);
    const [received, setReceived] = useState<CollabRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchCollabs = useCallback(async () => {
        try {
            const res = await fetch("/api/collab");
            if (res.ok) {
                const data = await res.json();
                setSent(data.sent || []);
                setReceived(data.received || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCollabs();
    }, [fetchCollabs]);

    const handleAction = async (id: string, status: "accepted" | "rejected") => {
        setProcessingId(id);
        try {
            const res = await fetch("/api/collab", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            if (res.ok) {
                showToast("success", status === "accepted" ? "Collaboration accepted! You can now DM each other." : "Request declined.");
                fetchCollabs();
            } else {
                showToast("error", "Failed to update request");
            }
        } catch (e) {
            showToast("error", "Network error");
        } finally {
            setProcessingId(null);
        }
    };

    const incoming = received.filter((r) => r.status === "pending");
    const outgoing = sent;
    const active = [
        ...received.filter((r) => r.status === "accepted"),
        ...sent.filter((r) => r.status === "accepted"),
    ];

    const currentItems = activeTab === "Incoming" ? incoming : activeTab === "Outgoing" ? outgoing : active;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-20">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                            <Users size={22} className="text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary font-display">
                                Collaborations
                            </h1>
                            <p className="text-small text-text-muted">
                                Manage your collaboration requests
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center border-b border-border mb-6">
                        {tabs.map((tab) => {
                            const count = tab === "Incoming" ? incoming.length : tab === "Outgoing" ? outgoing.length : active.length;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-5 py-3 text-button font-medium transition-colors ${
                                        activeTab === tab ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {tab}
                                        {count > 0 && (
                                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-pill ${
                                                activeTab === tab ? "bg-accent text-accent-inverse" : "bg-surface-alt text-text-muted"
                                            }`}>
                                                {count}
                                            </span>
                                        )}
                                    </span>
                                    {activeTab === tab && (
                                        <motion.span
                                            layoutId="collabTab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full"
                            />
                        </div>
                    ) : currentItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-surface-alt rounded-full flex items-center justify-center">
                                {activeTab === "Incoming" ? <Inbox size={28} className="text-text-muted opacity-40" /> :
                                 activeTab === "Outgoing" ? <Send size={28} className="text-text-muted opacity-40" /> :
                                 <Sparkles size={28} className="text-text-muted opacity-40" />}
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                                {activeTab === "Incoming" ? "No incoming requests" :
                                 activeTab === "Outgoing" ? "No outgoing requests" :
                                 "No active collaborations"}
                            </h3>
                            <p className="text-text-muted text-small">
                                {activeTab === "Incoming" ? "When someone wants to collaborate on your posts, you'll see requests here." :
                                 activeTab === "Outgoing" ? "Send collab requests from posts marked 'Open to Collab' on the feed." :
                                 "Accepted collaborations will appear here. You'll be able to DM your collaborators."}
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {currentItems.map((item, i) => {
                                    const user = activeTab === "Incoming" ? item.fromUser : activeTab === "Outgoing" ? item.toUser : (item.fromUser?.id === session?.user?.id ? item.toUser : item.fromUser);
                                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                                    const contextTitle = item.post?.title || item.project?.name || "Unknown";

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <Avatar name={user?.name || "User"} image={user?.image} size="lg" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="font-semibold text-text-primary text-[0.9375rem]">
                                                            {user?.name || "User"}
                                                        </span>
                                                        <span className="text-label text-text-muted capitalize">{user?.role}</span>
                                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill flex items-center gap-1 ${statusCfg.color} ${statusCfg.bg}`}>
                                                            {statusCfg.icon} {statusCfg.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-small text-text-secondary mb-1">
                                                        {activeTab === "Incoming" ? "wants to collaborate on" : activeTab === "Outgoing" ? "you requested to collaborate on" : "collaborating on"}{" "}
                                                        <strong className="text-text-primary">&ldquo;{contextTitle}&rdquo;</strong>
                                                    </p>
                                                    {item.message && (
                                                        <p className="text-small text-text-muted bg-surface-alt rounded-btn px-3 py-2 mt-2 italic">
                                                            &ldquo;{item.message}&rdquo;
                                                        </p>
                                                    )}
                                                    <p className="text-label text-text-muted mt-2">{getTimeAgo(item.createdAt)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {/* Incoming pending: Accept/Reject */}
                                                    {activeTab === "Incoming" && item.status === "pending" && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                disabled={processingId === item.id}
                                                                onClick={() => handleAction(item.id, "accepted")}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-btn text-small font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                                                            >
                                                                <Check size={14} /> Accept
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                disabled={processingId === item.id}
                                                                onClick={() => handleAction(item.id, "rejected")}
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-btn text-small font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            >
                                                                <X size={14} /> Decline
                                                            </motion.button>
                                                        </>
                                                    )}
                                                    {/* Active: Message button */}
                                                    {activeTab === "Active" && (
                                                        <Link
                                                            href="/messages"
                                                            className="flex items-center gap-1.5 px-3 py-2 bg-accent text-accent-inverse rounded-btn text-small font-semibold hover:bg-accent-hover transition-colors"
                                                        >
                                                            <MessageCircle size={14} /> Message
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
