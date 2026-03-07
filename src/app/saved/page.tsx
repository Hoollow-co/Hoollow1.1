"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, Inbox } from "lucide-react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import FeedCard from "@/components/FeedCard";

interface Post {
    id: string;
    title: string;
    body: string;
    tags: string[];
    upvotes: number;
    authorId: string;
    author: { id: string; name: string; image: string; role: string; impactXP: number };
    createdAt: string;
    commentCount: number;
    isProject?: boolean;
    hasUpvoted?: boolean;
    isSaved?: boolean;
    imageUrl?: string | null;
    openToCollab?: boolean;
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

export default function SavedPage() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSaved = useCallback(async () => {
        try {
            const res = await fetch("/api/posts/saved");
            if (res.ok) setPosts(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSaved();
    }, [fetchSaved]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-20">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 bg-premium-soft rounded-full flex items-center justify-center">
                            <Bookmark size={22} className="text-premium" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary font-display">
                                Saved Posts
                            </h1>
                            <p className="text-small text-text-muted">
                                Posts you&apos;ve bookmarked for later
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-surface border border-border rounded-card p-6 animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-surface-alt rounded-full" />
                                        <div className="space-y-1.5 flex-1">
                                            <div className="h-3 bg-surface-alt rounded w-1/3" />
                                            <div className="h-2 bg-surface-alt rounded w-1/4" />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-surface-alt rounded w-3/4 mb-3" />
                                    <div className="h-3 bg-surface-alt rounded w-full mb-2" />
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-surface-alt rounded-full flex items-center justify-center">
                                <Inbox size={28} className="text-text-muted opacity-40" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">No saved posts</h3>
                            <p className="text-text-muted text-small">
                                Bookmark posts from the feed to save them here for later.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {posts.map((post, i) => (
                                <motion.div key={post.id} variants={fadeInUp} custom={i}>
                                    <FeedCard
                                        post={post}
                                        onUpvote={fetchSaved}
                                        onPostUpdated={fetchSaved}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>
        </>
    );
}
