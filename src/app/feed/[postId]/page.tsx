"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Check } from "lucide-react";
import Link from "next/link";
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

export default function PostDetailPage({ params }: { params: { postId: string } }) {
    const { data: session } = useSession();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [shared, setShared] = useState(false);

    const fetchPost = useCallback(async () => {
        try {
            const res = await fetch(`/api/posts/${params.postId}`);
            if (res.ok) {
                setPost(await res.json());
            } else if (res.status === 404) {
                setNotFound(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [params.postId]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-20">
                <div className="max-w-2xl mx-auto px-4 py-8">
                    {/* Back + Share */}
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            href="/feed"
                            className="flex items-center gap-2 text-small font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Feed
                        </Link>
                        {post && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                                className="flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-btn hover:bg-surface-alt"
                            >
                                {shared ? (
                                    <><Check size={14} className="text-success" /> Copied!</>
                                ) : (
                                    <><Share2 size={14} /> Share</>
                                )}
                            </motion.button>
                        )}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="bg-surface border border-border rounded-card p-6 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-surface-alt rounded-full" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3 bg-surface-alt rounded w-1/3" />
                                    <div className="h-2 bg-surface-alt rounded w-1/4" />
                                </div>
                            </div>
                            <div className="h-5 bg-surface-alt rounded w-3/4 mb-3" />
                            <div className="h-3 bg-surface-alt rounded w-full mb-2" />
                            <div className="h-3 bg-surface-alt rounded w-full mb-2" />
                            <div className="h-3 bg-surface-alt rounded w-2/3" />
                        </div>
                    ) : notFound ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <h2 className="text-xl font-bold text-text-primary mb-2">Post not found</h2>
                            <p className="text-text-muted mb-6">This post may have been deleted or doesn&apos;t exist.</p>
                            <Link href="/feed" className="text-accent font-semibold hover:underline">
                                Go to Feed
                            </Link>
                        </motion.div>
                    ) : post ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FeedCard
                                post={post}
                                onUpvote={fetchPost}
                                onPostUpdated={fetchPost}
                            />
                        </motion.div>
                    ) : null}
                </div>
            </main>
        </>
    );
}
