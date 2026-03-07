"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Rocket,
    Users,
    Briefcase,
    User,
    Shield,
    Sparkles,
    Lock,
    TrendingUp,
    Plus,
    X,
    Github,
    Bookmark,
    Image as ImageIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FeedCard from "@/components/FeedCard";
import ImpactXPBadge from "@/components/ImpactXPBadge";
import XPProgressBar from "@/components/XPProgressBar";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { useSession } from "next-auth/react";
import { showToast } from "@/store";

const feedTabs = ["For You", "Trending"];

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
}

interface LeaderboardUser {
    id: string;
    name: string;
    image: string;
    role: string;
    impactXP: number;
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
};

export default function FeedPage() {
    const [activeTab, setActiveTab] = useState("For You");
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", body: "", tags: "", imageUrl: "", openToCollab: false });
    const [creating, setCreating] = useState(false);

    const userName = session?.user?.name || "User";
    const userXP = session?.user?.impactXP || 50;
    const profileSlug = session?.user?.id || "me";

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch("/api/posts");
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            } else {
                showToast("error", "Failed to load posts");
            }
        } catch (e) {
            showToast("error", "Network error — couldn't load posts");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch("/api/users/leaderboard");
            if (res.ok) setLeaderboard(await res.json());
        } catch (e) {
            console.error("Failed to fetch leaderboard", e);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchLeaderboard();
    }, [fetchPosts, fetchLeaderboard]);

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.body) return;
        setCreating(true);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newPost.title,
                    body: newPost.body,
                    tags: newPost.tags ? newPost.tags.split(",").map((t) => t.trim()) : [],
                    imageUrl: newPost.imageUrl || null,
                    openToCollab: newPost.openToCollab,
                }),
            });
            if (res.ok) {
                setNewPost({ title: "", body: "", tags: "", imageUrl: "", openToCollab: false });
                setShowCreateModal(false);
                showToast("success", "Post published! +5 XP");
                fetchPosts();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to create post");
            }
        } catch (e) {
            showToast("error", "Network error — couldn't publish post");
        } finally {
            setCreating(false);
        }
    };


    const displayPosts =
        activeTab === "Trending"
            ? [...posts].sort((a, b) => b.upvotes - a.upvotes)
            : posts;

    const sidebarNav = [
        { icon: <Home size={18} />, label: "Feed", href: "/feed", active: true },
        { icon: <Rocket size={18} />, label: "Launchpad", href: "/launchpad" },
        { icon: <Users size={18} />, label: "Clubs", href: "/clubs" },
        { icon: <Users size={18} />, label: "Collab", href: "/collab" },
        { icon: <Bookmark size={18} />, label: "Saved", href: "/saved" },
        { icon: <Briefcase size={18} />, label: "Notifications", href: "/notifications" },
        { icon: <User size={18} />, label: "Profile", href: `/profile/${profileSlug}` },
    ];

    return (
        <>
            <Navbar />
            <div className="max-w-content mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-8">
                    {/* ─── Left Sidebar ─── */}
                    <aside className="hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="sticky top-[76px] space-y-6"
                        >
                            <div className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar name={userName} image={session?.user?.image || ""} size="lg" />
                                    <div>
                                        <p className="font-semibold text-text-primary text-[0.9375rem]">{userName}</p>
                                        <ImpactXPBadge score={userXP} size="sm" />
                                    </div>
                                </div>
                                <XPProgressBar current={userXP} max={2500} />
                            </div>

                            <nav className="bg-surface border border-border rounded-card p-3">
                                {sidebarNav.map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-small font-medium transition-all duration-200 ${item.active
                                                ? "bg-surface-alt text-text-primary shadow-sm"
                                                : "text-text-secondary hover:bg-surface-alt hover:text-text-primary hover:translate-x-1"
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="bg-surface border border-border rounded-card p-4">
                                <p className="text-label text-text-muted mb-3 uppercase tracking-wider font-semibold">Environment</p>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn bg-surface-alt text-text-primary text-small font-medium">
                                        <Shield size={16} /> Human
                                    </button>
                                    <Link href="/super" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-text-muted text-small font-medium hover:bg-surface-alt transition-colors group">
                                        <Sparkles size={16} className="text-premium group-hover:animate-pulse" /> Super
                                        <Lock size={12} className="ml-auto text-text-muted" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </aside>

                    {/* ─── Center Feed ─── */}
                    <main>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center justify-between mb-6"
                        >
                            <div className="flex items-center gap-1 border-b border-border flex-1">
                                {feedTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-4 py-3 text-button font-medium transition-colors duration-200 ${activeTab === tab ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <motion.span
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary rounded-full"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)} className="ml-4 flex-shrink-0">
                                    <Plus size={16} className="mr-1" /> Post
                                </Button>
                            </motion.div>
                        </motion.div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-surface border border-border rounded-card p-6"
                                    >
                                        <div className="animate-pulse">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-surface-alt rounded-full" />
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="h-3 bg-surface-alt rounded w-1/3" />
                                                    <div className="h-2 bg-surface-alt rounded w-1/4" />
                                                </div>
                                            </div>
                                            <div className="h-4 bg-surface-alt rounded w-3/4 mb-3" />
                                            <div className="h-3 bg-surface-alt rounded w-full mb-2" />
                                            <div className="h-3 bg-surface-alt rounded w-2/3" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : displayPosts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16"
                            >
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-16 h-16 mx-auto mb-4 bg-surface-alt rounded-full flex items-center justify-center"
                                >
                                    <Plus size={24} className="text-text-muted" />
                                </motion.div>
                                <p className="text-text-muted text-lg mb-2">No posts yet</p>
                                <p className="text-text-muted text-small mb-4">Be the first one to share something!</p>
                                <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create First Post</Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {displayPosts.map((post, i) => (
                                    <motion.div key={post.id} variants={fadeInUp} custom={i}>
                                        <FeedCard post={post} onUpvote={fetchPosts} onPostUpdated={fetchPosts} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </main>

                    {/* ─── Right Sidebar ─── */}
                    <aside className="hidden lg:block">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="sticky top-[76px] space-y-6"
                        >
                            <div className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                                <h3 className="text-label text-text-primary mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <TrendingUp size={14} />
                                    Top Builders This Week
                                </h3>
                                <div className="space-y-3">
                                    {leaderboard.map((user, i) => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                        >
                                            <Link
                                                href={`/profile/${user.id}`}
                                                className="flex items-center gap-3 hover:bg-surface-alt -mx-2 px-2 py-1.5 rounded-btn transition-all duration-200 group"
                                            >
                                                <span className="text-small font-bold text-text-muted w-4">{i + 1}</span>
                                                <Avatar name={user.name || "User"} image={user.image} size="sm" />
                                                <span className="text-small font-medium text-text-primary flex-1 truncate group-hover:translate-x-0.5 transition-transform">{user.name || "User"}</span>
                                                <ImpactXPBadge score={user.impactXP} size="sm" showIcon={false} />
                                            </Link>
                                        </motion.div>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <p className="text-small text-text-muted">No builders yet</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </aside>
                </div>
            </div>

            {/* ─── Create Post Modal ─── */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-surface rounded-card p-6 max-w-lg w-full shadow-modal relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                            >
                                <X size={20} />
                            </motion.button>
                            <h2 className="font-display text-xl font-semibold text-text-primary mb-6">Create Post</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        placeholder="What did you build or learn?"
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Body</label>
                                    <textarea
                                        value={newPost.body}
                                        onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                                        placeholder="Share details about your project, learning, or thoughts..."
                                        rows={5}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">
                                        Tags <span className="text-text-muted">(comma separated)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newPost.tags}
                                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                        placeholder="React, AI/ML, Open Source"
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5 flex items-center gap-2">
                                        <ImageIcon size={14} /> Image URL <span className="text-text-muted">(optional)</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={newPost.imageUrl}
                                        onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.png"
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-card">
                                    <div>
                                        <p className="text-small font-medium text-text-primary">Open to Collaborate</p>
                                        <p className="text-label text-text-muted">Let others request to work with you</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNewPost({ ...newPost, openToCollab: !newPost.openToCollab })}
                                        className={`w-12 h-7 rounded-pill relative transition-colors ${newPost.openToCollab ? "bg-success" : "bg-border"}`}
                                    >
                                        <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${newPost.openToCollab ? "translate-x-5" : "translate-x-0.5"}`} />
                                    </button>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="primary" onClick={handleCreatePost} disabled={creating || !newPost.title || !newPost.body} className={creating ? "opacity-50" : ""}>
                                            {creating ? "Posting..." : "Publish Post"}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
