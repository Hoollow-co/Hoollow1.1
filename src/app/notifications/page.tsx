"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    ChevronUp,
    Users,
    MessageCircle,
    Check,
    CheckCheck,
    Trash2,
    ArrowLeft,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";

interface Notification {
    id: string;
    type: string;
    message: string;
    read: boolean;
    relatedId?: string;
    createdAt: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
    upvote: <ChevronUp size={16} className="text-accent" />,
    comment: <MessageCircle size={16} className="text-blue-500" />,
    club_invite: <Users size={16} className="text-purple-500" />,
    collab_request: <Users size={16} className="text-green-500" />,
    message_request: <MessageCircle size={16} className="text-orange-500" />,
    dm: <MessageCircle size={16} className="text-accent" />,
};

const TYPE_BG: Record<string, string> = {
    upvote: "bg-accent/10",
    comment: "bg-blue-50",
    club_invite: "bg-purple-50",
    collab_request: "bg-green-50",
    message_request: "bg-orange-50",
    dm: "bg-accent/10",
};

export default function NotificationsPage() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ readAll: true }),
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error(e);
        }
    };

    const markRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [id] }),
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const getTimeAgo = (date: string) => {
        const ms = Date.now() - new Date(date).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `${days}d`;
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-20">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                                <Bell size={20} className="text-accent" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary font-display">
                                    Notifications
                                </h1>
                                {unreadCount > 0 && (
                                    <p className="text-small text-text-muted">
                                        {unreadCount} unread
                                    </p>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={markAllRead}
                                className="text-small font-medium text-accent hover:text-accent-hover flex items-center gap-1.5 transition-colors"
                            >
                                <CheckCheck size={16} /> Mark all read
                            </motion.button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full"
                            />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <Bell size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                                All caught up!
                            </h3>
                            <p className="text-text-muted">
                                You&apos;ll see notifications here when someone interacts with your content.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notif, i) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => !notif.read && markRead(notif.id)}
                                    className={`flex items-start gap-3 p-4 rounded-card cursor-pointer transition-all ${notif.read
                                            ? "bg-transparent hover:bg-surface-alt"
                                            : "bg-surface border border-border hover:shadow-card-hover"
                                        }`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_BG[notif.type] || "bg-surface-alt"
                                            }`}
                                    >
                                        {TYPE_ICON[notif.type] || <Bell size={16} className="text-text-muted" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-small ${notif.read
                                                    ? "text-text-muted"
                                                    : "text-text-primary font-medium"
                                                }`}
                                        >
                                            {notif.message}
                                        </p>
                                        <p className="text-label text-text-muted mt-0.5">
                                            {getTimeAgo(notif.createdAt)}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2.5 h-2.5 bg-accent rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
