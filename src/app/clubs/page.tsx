"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClubCard from "@/components/ClubCard";
import Button from "@/components/Button";

interface Club {
    id: string;
    name: string;
    description: string;
    type: string;
    domain: string;
    gradient: string;
    tags: string[];
    memberCount: number;
    members: { id: string; name: string; image: string; impactXP: number }[];
    impactXP: number;
}

const typeFilters = ["All", "Open", "Invite Only", "Application"];
const domainFilters = ["All", "Tech", "Design", "Business", "Research"];

const gradientOptions = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

export default function ClubsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeType, setActiveType] = useState("All");
    const [activeDomain, setActiveDomain] = useState("All");
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClub, setNewClub] = useState({ name: "", description: "", type: "open", domain: "Tech", tags: "" });
    const [creating, setCreating] = useState(false);

    const fetchClubs = useCallback(async () => {
        try {
            const res = await fetch("/api/clubs");
            if (res.ok) setClubs(await res.json());
        } catch (e) {
            console.error("Failed to fetch clubs", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    const handleCreateClub = async () => {
        if (!newClub.name || !newClub.description) return;
        setCreating(true);
        try {
            const res = await fetch("/api/clubs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newClub.name,
                    description: newClub.description,
                    type: newClub.type,
                    domain: newClub.domain,
                    tags: newClub.tags ? newClub.tags.split(",").map((t) => t.trim()) : [],
                    gradient: gradientOptions[Math.floor(Math.random() * gradientOptions.length)],
                }),
            });
            if (res.ok) {
                setNewClub({ name: "", description: "", type: "open", domain: "Tech", tags: "" });
                setShowCreateModal(false);
                fetchClubs();
            }
        } catch (e) {
            console.error("Failed to create club", e);
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async (clubId: string) => {
        try {
            await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
            fetchClubs();
        } catch (e) {
            console.error("Failed to join club", e);
        }
    };

    const filteredClubs = clubs.filter((club) => {
        const matchesSearch =
            !searchQuery ||
            club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
            activeType === "All" ||
            (activeType === "Open" && club.type === "open") ||
            (activeType === "Invite Only" && club.type === "invite") ||
            (activeType === "Application" && club.type === "application");
        const matchesDomain = activeDomain === "All" || club.domain === activeDomain;
        return matchesSearch && matchesType && matchesDomain;
    });

    return (
        <>
            <Navbar />
            <main className="min-h-screen">
                {/* ─── Create Club Banner ─── */}
                <section className="bg-accent">
                    <div className="max-w-content mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-bg mb-1">
                                Start your own Club. Earn collective ImpactXP.
                            </h2>
                            <p className="text-bg/60 text-small">
                                Form a team, collaborate on projects, and grow together.
                            </p>
                        </div>
                        <Button variant="white-outline" size="md" onClick={() => setShowCreateModal(true)}>
                            Create Club <ArrowRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </section>

                <div className="max-w-content mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
                        {/* ─── Left Filter Panel ─── */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-[76px] space-y-6">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search clubs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-label text-text-muted mb-3 uppercase tracking-wider font-semibold">Type</p>
                                    <div className="space-y-1">
                                        {typeFilters.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setActiveType(type)}
                                                className={`w-full text-left px-3 py-2 rounded-btn text-small font-medium transition-colors ${activeType === type ? "bg-surface-alt text-text-primary" : "text-text-secondary hover:bg-surface-alt"}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-label text-text-muted mb-3 uppercase tracking-wider font-semibold">Domain</p>
                                    <div className="space-y-1">
                                        {domainFilters.map((domain) => (
                                            <button
                                                key={domain}
                                                onClick={() => setActiveDomain(domain)}
                                                className={`w-full text-left px-3 py-2 rounded-btn text-small font-medium transition-colors ${activeDomain === domain ? "bg-surface-alt text-text-primary" : "text-text-secondary hover:bg-surface-alt"}`}
                                            >
                                                {domain}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ─── Main Grid ─── */}
                        <div>
                            <h1 className="font-display text-section text-text-primary mb-8">Find your crew.</h1>

                            {/* Mobile Filters */}
                            <div className="lg:hidden mb-6 space-y-4">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search clubs..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto">
                                    {typeFilters.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setActiveType(type)}
                                            className={`px-3 py-1.5 rounded-pill text-label whitespace-nowrap transition-colors ${activeType === type ? "bg-accent text-accent-inverse" : "bg-surface-alt text-text-secondary"}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-surface border border-border rounded-card overflow-hidden animate-pulse">
                                            <div className="h-28 bg-surface-alt" />
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-surface-alt rounded w-3/4" />
                                                <div className="h-3 bg-surface-alt rounded w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredClubs.map((club, i) => (
                                        <motion.div
                                            key={club.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                        >
                                            <ClubCard club={club} onJoin={() => handleJoin(club.id)} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {!loading && filteredClubs.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-text-muted text-lg mb-2">No clubs found</p>
                                    <p className="text-text-muted text-small mb-4">
                                        Try adjusting your filters, or create the first club!
                                    </p>
                                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                        Create Club
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* ─── Create Club Modal ─── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-card p-6 max-w-lg w-full shadow-modal relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
                            <X size={20} />
                        </button>
                        <h2 className="font-display text-xl font-semibold text-text-primary mb-6">Create Club</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5">Club Name</label>
                                <input
                                    type="text"
                                    value={newClub.name}
                                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                                    placeholder="AI Builders Collective"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5">Description</label>
                                <textarea
                                    value={newClub.description}
                                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                                    placeholder="What's this club about?"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Type</label>
                                    <select
                                        value={newClub.type}
                                        onChange={(e) => setNewClub({ ...newClub, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-colors"
                                    >
                                        <option value="open">Open</option>
                                        <option value="invite">Invite Only</option>
                                        <option value="application">Application</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Domain</label>
                                    <select
                                        value={newClub.domain}
                                        onChange={(e) => setNewClub({ ...newClub, domain: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-colors"
                                    >
                                        <option value="Tech">Tech</option>
                                        <option value="Design">Design</option>
                                        <option value="Business">Business</option>
                                        <option value="Research">Research</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-small font-medium text-text-primary block mb-1.5">
                                    Tags <span className="text-text-muted">(comma separated)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newClub.tags}
                                    onChange={(e) => setNewClub({ ...newClub, tags: e.target.value })}
                                    placeholder="AI/ML, Demos, Community"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    onClick={handleCreateClub}
                                    disabled={creating || !newClub.name || !newClub.description}
                                    className={creating ? "opacity-50" : ""}
                                >
                                    {creating ? "Creating..." : "Create Club"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
