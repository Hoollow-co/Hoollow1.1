"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import ImpactXPBadge from "@/components/ImpactXPBadge";
import RoleBadge from "@/components/RoleBadge";
import XPProgressBar from "@/components/XPProgressBar";
import ProjectCard from "@/components/ProjectCard";
import FeedCard from "@/components/FeedCard";
import Button from "@/components/Button";
import {
    MessageCircle,
    Edit3,
    X,
    Check,
    Plus,
    ExternalLink,
    Calendar,
    Award,
    Zap,
    Share2,
    Copy,
    Link as LinkIcon,
    Github,
    Twitter,
} from "lucide-react";
import { xpHistory } from "@/lib/mockData";

const skillOptions = [
    "React", "Next.js", "TypeScript", "Python", "Node.js", "Flutter",
    "Figma", "UI/UX", "Product Design", "Go-to-Market", "Machine Learning",
    "Data Science", "DevOps", "Blockchain", "IoT", "3D Printing",
    "Content Writing", "Marketing", "Fundraising", "Leadership",
];

// ── Sparkline Chart ──
function Sparkline({ data }: { data: { xp: number }[] }) {
    const max = Math.max(...data.map((d) => d.xp));
    const min = Math.min(...data.map((d) => d.xp));
    const range = max - min || 1;
    const width = 200;
    const height = 40;
    const points = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d.xp - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width={width} height={height} className="overflow-visible">
            <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
            </defs>
            <polyline points={points + ` ${width},${height} 0,${height}`} fill="url(#sparkGrad)" />
            <polyline
                points={points}
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ── Stat Counter ──
function AnimatedStat({ value, label }: { value: number; label: string }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let frame: number;
        const start = Date.now();
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / 600, 1);
            setDisplay(Math.round(progress * value));
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [value]);

    return (
        <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-bg tabular-nums">{display}</p>
            <p className="text-label text-slate-500 dark:text-bg/40">{label}</p>
        </div>
    );
}

interface UserProfile {
    id: string;
    name: string;
    image: string;
    role: string;
    impactXP: number;
    bio: string;
    skills: string[];
    openToCollab: boolean;
    createdAt: string;
    posts: any[];
    projects: any[];
    clubMembers: { club: { id: string; name: string; gradient: string; _count: { members: number } } }[];
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

export default function ProfilePage({ params }: { params: { username: string } }) {
    const { data: session } = useSession();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("projects");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showShareToast, setShowShareToast] = useState(false);

    // Edit Profile state
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editSkills, setEditSkills] = useState<string[]>([]);
    const [editCollab, setEditCollab] = useState(true);
    const [saving, setSaving] = useState(false);

    const userId = params.username;
    const isOwnProfile = session?.user?.id === userId;

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (e) {
            console.error("Failed to fetch profile", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    // Fallback from session for own profile
    const displayUser = user || (isOwnProfile && session?.user ? {
        id: session.user.id,
        name: session.user.name || "User",
        image: session.user.image || "",
        role: session.user.role || "builder",
        impactXP: session.user.impactXP || 50,
        bio: "",
        skills: [],
        openToCollab: true,
        createdAt: new Date().toISOString(),
        posts: [],
        projects: [],
        clubMembers: [],
    } : null);

    // Open edit modal with current data
    const openEditModal = () => {
        if (displayUser) {
            setEditName(displayUser.name || "");
            setEditBio(displayUser.bio || "");
            setEditSkills(Array.isArray(displayUser.skills) ? displayUser.skills : []);
            setEditCollab(displayUser.openToCollab ?? true);
        }
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: editName,
                    bio: editBio,
                    skills: editSkills,
                    role: displayUser?.role || "builder",
                    openToCollab: editCollab,
                }),
            });
            if (res.ok) {
                setShowEditModal(false);
                fetchProfile();
            }
        } catch (e) {
            console.error("Failed to save profile", e);
        } finally {
            setSaving(false);
        }
    };

    const toggleEditSkill = (skill: string) => {
        setEditSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
    };

    const memberSince = displayUser?.createdAt
        ? new Date(displayUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "";

    // ── Loading ──
    if (loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full"
                    />
                </main>
            </>
        );
    }

    if (!displayUser) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex flex-col items-center justify-center gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <div className="w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mb-4">
                            <X size={32} className="text-text-muted" />
                        </div>
                    </motion.div>
                    <h1 className="text-2xl font-display font-bold text-text-primary">User not found</h1>
                    <p className="text-text-muted">This profile doesn&apos;t exist yet.</p>
                </main>
                <Footer />
            </>
        );
    }

    const skills = Array.isArray(displayUser.skills) ? displayUser.skills : [];
    const clubs = displayUser.clubMembers || [];
    const posts = (displayUser.posts || []).map((p: any) => ({
        ...p,
        upvotes: p._count?.upvotes || p.upvotes || 0,
        commentCount: p._count?.comments || p.commentCount || 0,
        tags: Array.isArray(p.tags) ? p.tags : [],
        author: p.author || { id: displayUser.id, name: displayUser.name, image: displayUser.image, role: displayUser.role, impactXP: displayUser.impactXP },
    }));
    const projects = (displayUser.projects || []).map((p: any) => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
        author: p.author || { id: displayUser.id, name: displayUser.name, image: displayUser.image, role: displayUser.role, impactXP: displayUser.impactXP },
    }));

    const profileTabs = [
        { id: "projects", label: "Projects", count: projects.length },
        { id: "posts", label: "Posts", count: posts.length },
        { id: "clubs", label: "Clubs", count: clubs.length },
    ];

    return (
        <>
            <Navbar />
            <main>
                {/* ─── Profile Header ─── */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-accent py-12 md:py-16 relative overflow-hidden"
                >
                    {/* Decorative background */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-10 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="max-w-content mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            >
                                <Avatar name={displayUser.name || "User"} image={displayUser.image} size="xl" className="ring-4 ring-white/20 shadow-lg" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1"
                            >
                                <h1 className="font-display text-[2rem] font-bold text-slate-900 dark:text-bg mb-2">
                                    {displayUser.name || "User"}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <RoleBadge role={displayUser.role} />
                                    <ImpactXPBadge score={displayUser.impactXP} size="md" />
                                    {memberSince && (
                                        <span className="text-label text-slate-500 dark:text-bg/40 flex items-center gap-1">
                                            <Calendar size={12} /> {memberSince}
                                        </span>
                                    )}
                                </div>
                                {displayUser.bio && (
                                    <p className="text-slate-700 dark:text-bg/70 text-body mb-4 max-w-lg">{displayUser.bio}</p>
                                )}
                                <Sparkline data={xpHistory} />
                                <div className="flex flex-wrap gap-6 mt-6">
                                    <AnimatedStat value={projects.length} label="Projects" />
                                    <AnimatedStat value={clubs.length} label="Clubs" />
                                    <AnimatedStat value={posts.length} label="Posts" />
                                    <AnimatedStat value={displayUser.impactXP} label="ImpactXP" />
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="self-start flex gap-2"
                            >
                                {isOwnProfile ? (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="white-outline" size="md" onClick={openEditModal}>
                                            <Edit3 size={14} className="mr-2" /> Edit Profile
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="white" size="md" onClick={async () => {
                                            try {
                                                const res = await fetch("/api/dm", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ action: "request", toUserId: userId }),
                                                });
                                                if (res.ok) {
                                                    alert("Message request sent!");
                                                } else {
                                                    const data = await res.json();
                                                    alert(data.error || "Could not send request");
                                                }
                                            } catch { alert("Failed to send request"); }
                                        }}>
                                            <MessageCircle size={14} className="mr-2" /> Message
                                        </Button>
                                    </motion.div>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleShare}
                                    className="w-10 h-10 rounded-btn border border-white/20 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-bg/60 dark:hover:text-bg hover:border-white/40 transition-colors"
                                >
                                    <Share2 size={16} />
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* ─── Content Tabs ─── */}
                <div className="max-w-content mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                        {/* Left Column */}
                        <div>
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 border-b border-border mb-8">
                                {profileTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative px-4 py-3 text-button font-medium transition-colors duration-200 ${activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
                                    >
                                        {tab.label}
                                        <span className={`ml-1.5 text-label px-1.5 py-0.5 rounded-pill ${activeTab === tab.id ? "bg-accent text-accent-inverse" : "bg-surface-alt text-text-muted"}`}>
                                            {tab.count}
                                        </span>
                                        {activeTab === tab.id && (
                                            <motion.span
                                                layoutId="profileTab"
                                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary rounded-full"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeTab === "projects" && (
                                    <motion.div
                                        key="projects"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {projects.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {projects.map((project: any, i: number) => (
                                                    <motion.div key={project.id} variants={fadeInUp} custom={i} initial="hidden" animate="visible">
                                                        <ProjectCard project={project} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={<Zap size={24} />}
                                                title="No projects yet"
                                                desc={isOwnProfile ? "Launch your first project on the Launchpad!" : "This builder hasn't launched any projects yet."}
                                                cta={isOwnProfile ? { label: "Go to Launchpad", href: "/launchpad" } : undefined}
                                            />
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "posts" && (
                                    <motion.div
                                        key="posts"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {posts.length > 0 ? (
                                            <div className="space-y-4">
                                                {posts.map((post: any, i: number) => (
                                                    <motion.div key={post.id} variants={fadeInUp} custom={i} initial="hidden" animate="visible">
                                                        <FeedCard post={post} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={<MessageCircle size={24} />}
                                                title="No posts yet"
                                                desc={isOwnProfile ? "Share what you're building in the Feed!" : "This builder hasn't posted anything yet."}
                                                cta={isOwnProfile ? { label: "Go to Feed", href: "/feed" } : undefined}
                                            />
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "clubs" && (
                                    <motion.div
                                        key="clubs"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {clubs.length > 0 ? (
                                            <div className="space-y-3">
                                                {clubs.map((cm: any, i: number) => (
                                                    <motion.div
                                                        key={cm.club.id}
                                                        variants={fadeInUp}
                                                        custom={i}
                                                        initial="hidden"
                                                        animate="visible"
                                                        whileHover={{ x: 4 }}
                                                        className="bg-surface border border-border rounded-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-card-hover transition-shadow"
                                                    >
                                                        <div className="w-12 h-12 rounded-btn flex-shrink-0" style={{ background: cm.club.gradient }} />
                                                        <div className="flex-1">
                                                            <p className="text-small font-semibold text-text-primary">{cm.club.name}</p>
                                                            <p className="text-label text-text-muted">{cm.club._count?.members || 0} members</p>
                                                        </div>
                                                        <ExternalLink size={14} className="text-text-muted" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={<Plus size={24} />}
                                                title="No clubs joined"
                                                desc={isOwnProfile ? "Find your crew and start collaborating!" : "This builder hasn't joined any clubs yet."}
                                                cta={isOwnProfile ? { label: "Browse Clubs", href: "/clubs" } : undefined}
                                            />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ─── Right Column ─── */}
                        <motion.aside
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Skills */}
                            <div className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                                <h3 className="text-label text-text-primary mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <Award size={14} /> Skills
                                </h3>
                                {skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill: string, i: number) => (
                                            <motion.span
                                                key={skill}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="text-small px-3 py-1.5 rounded-pill bg-surface-alt text-text-primary font-medium hover:bg-border transition-colors cursor-default"
                                            >
                                                {skill}
                                            </motion.span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-text-muted text-small">No skills listed.</p>
                                )}
                            </div>

                            {/* Open to Collab */}
                            <div className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-label text-text-primary uppercase tracking-wider font-semibold">
                                        Open to Collaborate
                                    </h3>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`w-10 h-6 rounded-pill relative cursor-pointer transition-colors ${displayUser.openToCollab ? "bg-success" : "bg-border"}`}
                                    >
                                        <motion.div
                                            animate={{ x: displayUser.openToCollab ? 16 : 2 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className="absolute top-0.5 w-5 h-5 rounded-full bg-text-primary shadow"
                                        />
                                    </motion.div>
                                </div>
                                <p className="text-small text-text-muted">
                                    {displayUser.openToCollab
                                        ? "Other builders can request to collaborate"
                                        : "Not accepting collaboration requests"}
                                </p>
                            </div>

                            {/* XP Breakdown */}
                            <div className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                                <h3 className="text-label text-text-primary mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <Zap size={14} /> XP Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Posts", value: posts.length * 5, color: "bg-blue-400" },
                                        { label: "Projects", value: projects.length * 10, color: "bg-purple-400" },
                                        { label: "Engagement", value: Math.max(0, displayUser.impactXP - posts.length * 5 - projects.length * 10), color: "bg-green-400" },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="flex justify-between text-small mb-1">
                                                <span className="text-text-secondary">{item.label}</span>
                                                <span className="font-semibold text-text-primary">+{item.value} XP</span>
                                            </div>
                                            <div className="h-1.5 bg-surface-alt rounded-pill overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (item.value / Math.max(displayUser.impactXP, 1)) * 100)}%` }}
                                                    transition={{ delay: 0.5, duration: 0.8 }}
                                                    className={`h-full rounded-pill ${item.color}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-surface border border-border rounded-card p-5 hover:shadow-card-hover transition-shadow duration-300">
                                <h3 className="text-label text-text-primary mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <LinkIcon size={14} /> Links
                                </h3>
                                <div className="space-y-2">
                                    <a href="#" className="flex items-center gap-3 text-small text-text-secondary hover:text-text-primary transition-colors py-1.5 group">
                                        <Github size={16} className="group-hover:scale-110 transition-transform" /> GitHub
                                        <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                    <a href="#" className="flex items-center gap-3 text-small text-text-secondary hover:text-text-primary transition-colors py-1.5 group">
                                        <Twitter size={16} className="group-hover:scale-110 transition-transform" /> Twitter
                                        <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        </motion.aside>
                    </div>
                </div>
            </main>
            <Footer />

            {/* ─── Edit Profile Modal ─── */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-surface rounded-card p-6 max-w-lg w-full shadow-modal relative max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.button
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-4 right-4 text-text-muted hover:text-text-primary z-10"
                            >
                                <X size={20} />
                            </motion.button>

                            <h2 className="font-display text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                                <Edit3 size={18} /> Edit Profile
                            </h2>

                            <div className="space-y-5">
                                {/* Name */}
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">
                                        Bio <span className="text-text-muted">{editBio.length}/140</span>
                                    </label>
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value.slice(0, 140))}
                                        placeholder="What drives you? What are you building?"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all resize-none"
                                    />
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">
                                        Skills <span className="text-text-muted">{editSkills.length} selected</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {skillOptions.map((skill) => (
                                            <motion.button
                                                key={skill}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => toggleEditSkill(skill)}
                                                className={`text-small px-3 py-1.5 rounded-pill font-medium transition-all duration-200 ${editSkills.includes(skill)
                                                    ? "bg-accent text-accent-inverse shadow-sm"
                                                    : "bg-surface-alt text-text-secondary hover:bg-border"
                                                    }`}
                                            >
                                                {editSkills.includes(skill) && <Check size={12} className="inline mr-1" />}
                                                {skill}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Open to Collab */}
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-card">
                                    <div>
                                        <p className="text-small font-medium text-text-primary">Open to Collaborate</p>
                                        <p className="text-label text-text-muted">Let others know you&apos;re available</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setEditCollab(!editCollab)}
                                        className={`w-12 h-7 rounded-pill relative transition-colors ${editCollab ? "bg-success" : "bg-border"}`}
                                    >
                                        <motion.div
                                            animate={{ x: editCollab ? 20 : 2 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className="absolute top-0.5 w-6 h-6 rounded-full bg-text-primary shadow"
                                        />
                                    </motion.button>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="primary"
                                            onClick={handleSaveProfile}
                                            disabled={saving || !editName}
                                            className={saving ? "opacity-50" : ""}
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Share Toast ─── */}
            <AnimatePresence>
                {showShareToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-accent text-accent-inverse px-5 py-3 rounded-card shadow-lg flex items-center gap-2 text-small font-medium"
                    >
                        <Copy size={14} /> Profile link copied!
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ── Empty State Component ──
function EmptyState({ icon, title, desc, cta }: { icon: React.ReactNode; title: string; desc: string; cta?: { label: string; href: string } }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-surface border border-border rounded-card"
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 mx-auto mb-4 bg-surface-alt rounded-full flex items-center justify-center text-text-muted"
            >
                {icon}
            </motion.div>
            <p className="text-text-primary font-semibold mb-1">{title}</p>
            <p className="text-text-muted text-small mb-4">{desc}</p>
            {cta && (
                <a href={cta.href}>
                    <Button variant="ghost" size="sm">{cta.label}</Button>
                </a>
            )}
        </motion.div>
    );
}
