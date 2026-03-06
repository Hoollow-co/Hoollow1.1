"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowRight, X, Plus, Github, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import ImpactXPBadge from "@/components/ImpactXPBadge";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";

interface ProjectAuthor {
    id: string;
    name: string;
    image: string;
    role: string;
    impactXP: number;
}

interface Project {
    id: string;
    name: string;
    description: string;
    tags: string[] | string;
    upvotes: number;
    xpThreshold: number;
    authorId: string;
    author: ProjectAuthor;
    expiresAt: string;
    createdAt: string;
    thumbnail: string;
}

const categories = ["All", "SaaS", "Hardware", "Social", "EdTech", "AI/ML"];
const sortOptions = ["Most Voted", "Newest", "ImpactXP Threshold"];

function useCountdown() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Deterministic 48-hour cycle based on UNIX epoch
        const cycleMs = 48 * 60 * 60 * 1000;

        const update = () => {
            const now = Date.now();
            const remainder = now % cycleMs;
            const diff = cycleMs - remainder;

            setTimeLeft({
                hours: Math.floor(diff / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };

        update(); // immediate first update
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    return timeLeft;
}

export default function LaunchpadPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSort, setActiveSort] = useState("Most Voted");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", description: "", tags: "", githubUrl: "", imageUrl: "", openToCollab: false });
    const [submitting, setSubmitting] = useState(false);

    const countdown = useCountdown();

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) setProjects(await res.json());
        } catch (e) {
            console.error("Failed to fetch projects", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleSubmitProject = async () => {
        if (!newProject.name || !newProject.description) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newProject.name,
                    description: newProject.description,
                    tags: newProject.tags ? newProject.tags.split(",").map((t) => t.trim()) : [],
                    githubUrl: newProject.githubUrl || null,
                    imageUrl: newProject.imageUrl || null,
                    openToCollab: newProject.openToCollab,
                }),
            });
            if (res.ok) {
                setNewProject({ name: "", description: "", tags: "", githubUrl: "", imageUrl: "", openToCollab: false });
                setShowSubmitModal(false);
                fetchProjects();
            }
        } catch (e) {
            console.error("Failed to submit project", e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (projectId: string) => {
        try {
            await fetch(`/api/projects/${projectId}/upvote`, { method: "POST" });
            fetchProjects();
        } catch (e) {
            console.error("Failed to upvote project", e);
        }
    };

    const topProjects = [...projects].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);

    const filteredProjects =
        activeCategory === "All"
            ? projects
            : projects.filter((p) => {
                const tags = Array.isArray(p.tags) ? p.tags : [];
                return tags.some((t: string) => t.toLowerCase().includes(activeCategory.toLowerCase()));
            });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (activeSort === "Most Voted") return b.upvotes - a.upvotes;
        if (activeSort === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.xpThreshold - a.xpThreshold;
    });

    return (
        <>
            <Navbar />
            <main>
                {/* ─── Hero Strip ─── */}
                <section className="bg-accent py-16 md:py-20">
                    <div className="max-w-content mx-auto px-6 text-center">
                        <h1 className="font-display text-[3rem] font-bold text-bg mb-4">
                            Launchpad
                        </h1>
                        <p className="text-lg text-bg/60 mb-8">
                            Vote for the best projects in the next 48 hours.
                        </p>

                        <div className="flex justify-center gap-4 mb-8">
                            {[
                                { value: countdown.hours, label: "Hours" },
                                { value: countdown.minutes, label: "Min" },
                                { value: countdown.seconds, label: "Sec" },
                            ].map((unit) => (
                                <div key={unit.label} className="text-center">
                                    <div className="bg-white/10 rounded-card px-5 py-3 min-w-[72px]">
                                        <span className="text-3xl font-bold text-bg tabular-nums">
                                            {String(unit.value).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <span className="text-label text-bg/40 mt-2 block">{unit.label}</span>
                                </div>
                            ))}
                        </div>

                        <Button variant="white" size="lg" onClick={() => setShowSubmitModal(true)}>
                            Submit Your Project
                        </Button>
                    </div>
                </section>

                {/* ─── Top Projects Strip ─── */}
                <section className="py-8 border-b border-border">
                    <div className="max-w-content mx-auto px-6">
                        <h3 className="text-label text-text-primary mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Trophy size={14} className="text-[#D4AF37]" />
                            Top This Week — Visible to Investors
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {topProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex-shrink-0 w-[260px] bg-surface border-2 border-[#D4AF37]/30 rounded-card p-4 hover:border-[#D4AF37]/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <Avatar name={project.author.name || "User"} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-small font-semibold text-text-primary truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-label text-text-muted truncate">
                                                {project.author.name || "User"}
                                            </p>
                                        </div>
                                        <ImpactXPBadge score={project.upvotes} size="sm" showIcon={false} />
                                    </div>
                                    <p className="text-label text-text-secondary line-clamp-2">
                                        {project.description}
                                    </p>
                                </div>
                            ))}
                            {topProjects.length === 0 && (
                                <p className="text-small text-text-muted py-4">No projects yet. Be the first to submit!</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── Filter Bar ─── */}
                <div className="bg-surface border-b border-border sticky top-[60px] z-40">
                    <div className="max-w-content mx-auto px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-pill text-button font-medium transition-all duration-150 whitespace-nowrap ${activeCategory === cat
                                            ? "bg-accent text-accent-inverse"
                                            : "text-text-secondary hover:bg-surface-alt"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-small text-text-muted">Sort:</span>
                                {sortOptions.map((sort) => (
                                    <button
                                        key={sort}
                                        onClick={() => setActiveSort(sort)}
                                        className={`px-3 py-1.5 rounded-btn text-label transition-colors ${activeSort === sort
                                            ? "bg-surface-alt text-text-primary font-semibold"
                                            : "text-text-muted hover:text-text-secondary"
                                            }`}
                                    >
                                        {sort}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Project Grid ─── */}
                <section className="py-8">
                    <div className="max-w-content mx-auto px-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-surface border border-border rounded-card p-6 animate-pulse">
                                        <div className="h-4 bg-surface-alt rounded w-3/4 mb-3" />
                                        <div className="h-3 bg-surface-alt rounded w-full mb-2" />
                                        <div className="h-3 bg-surface-alt rounded w-2/3" />
                                    </div>
                                ))}
                            </div>
                        ) : sortedProjects.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-text-muted text-lg mb-2">No projects yet</p>
                                <p className="text-text-muted text-small mb-4">Submit the first project to the Launchpad!</p>
                                <Button variant="primary" onClick={() => setShowSubmitModal(true)}>
                                    Submit Project
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedProjects.map((project, i) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.3 }}
                                    >
                                        <ProjectCard project={project} onUpvote={() => handleUpvote(project.id)} onUpdated={fetchProjects} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />

            {/* ─── Submit Project Modal ─── */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-card p-6 max-w-lg w-full shadow-modal relative">
                        <button
                            onClick={() => setShowSubmitModal(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="font-display text-xl font-semibold text-text-primary mb-6">
                            Submit to Launchpad
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5">Project Name</label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="What's your project called?"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    placeholder="What does it do? Why did you build it?"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5">
                                    Tags <span className="text-text-muted">(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newProject.tags}
                                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                                    placeholder="SaaS, AI/ML, EdTech"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5 flex items-center gap-2"><Github size={14} /> GitHub URL <span className="text-text-muted">(optional)</span></label>
                                <input type="url" value={newProject.githubUrl} onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })} placeholder="https://github.com/user/repo" className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors" />
                            </div>
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5 flex items-center gap-2"><ImageIcon size={14} /> Image URL <span className="text-text-muted">(optional)</span></label>
                                <input type="url" value={newProject.imageUrl} onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })} placeholder="https://example.com/screenshot.png" className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-surface-alt rounded-card">
                                <div>
                                    <p className="text-small font-medium text-text-primary">Open to Collaborate</p>
                                    <p className="text-label text-text-muted">Let others request to join</p>
                                </div>
                                <button type="button" onClick={() => setNewProject({ ...newProject, openToCollab: !newProject.openToCollab })} className={`w-12 h-7 rounded-pill relative transition-colors ${newProject.openToCollab ? "bg-success" : "bg-border"}`}>
                                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${newProject.openToCollab ? "translate-x-5" : "translate-x-0.5"}`} />
                                </button>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmitProject}
                                    disabled={submitting || !newProject.name || !newProject.description}
                                    className={submitting ? "opacity-50" : ""}
                                >
                                    {submitting ? "Submitting..." : "Launch Project 🚀"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
