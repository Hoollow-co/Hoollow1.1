"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Github,
    ExternalLink,
    Edit3,
    Trash2,
    MoreHorizontal,
    Users,
    X,
    Check,
    Image as ImageIcon,
} from "lucide-react";
import Avatar from "./Avatar";
import ImpactXPBadge from "./ImpactXPBadge";
import UpvoteButton from "./UpvoteButton";
import Button from "./Button";
import { useSession } from "next-auth/react";

interface ProjectAuthor {
    id: string;
    name: string;
    image: string;
    role: string;
    impactXP: number;
}

interface ProjectData {
    id: string;
    name: string;
    description: string;
    tags: string[] | string;
    upvotes: number;
    xpThreshold: number;
    authorId: string;
    author: ProjectAuthor;
    expiresAt?: string;
    createdAt: string;
    thumbnail?: string;
    githubUrl?: string | null;
    imageUrl?: string | null;
    openToCollab?: boolean;
}

interface ProjectCardProps {
    project: ProjectData;
    onUpvote?: () => void;
    onUpdated?: () => void;
}

export default function ProjectCard({ project, onUpvote, onUpdated }: ProjectCardProps) {
    const { data: session } = useSession();
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const isOwner = session?.user?.id === project.authorId;

    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [collabMessage, setCollabMessage] = useState("");
    const [collabSent, setCollabSent] = useState(false);

    // Edit state
    const [editName, setEditName] = useState(project.name);
    const [editDesc, setEditDesc] = useState(project.description);
    const [editTags, setEditTags] = useState(tags.join(", "));
    const [editGithub, setEditGithub] = useState(project.githubUrl || "");
    const [editImage, setEditImage] = useState(project.imageUrl || "");
    const [editCollab, setEditCollab] = useState(project.openToCollab || false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleEdit = () => {
        setEditName(project.name);
        setEditDesc(project.description);
        setEditTags(tags.join(", "));
        setEditGithub(project.githubUrl || "");
        setEditImage(project.imageUrl || "");
        setEditCollab(project.openToCollab || false);
        setShowEditModal(true);
        setShowMenu(false);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/projects", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: project.id,
                    name: editName,
                    description: editDesc,
                    tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                    githubUrl: editGithub || null,
                    imageUrl: editImage || null,
                    openToCollab: editCollab,
                }),
            });
            if (res.ok) { setShowEditModal(false); onUpdated?.(); }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/projects?id=${project.id}`, { method: "DELETE" });
            if (res.ok) { setShowDeleteConfirm(false); onUpdated?.(); }
        } catch (e) { console.error(e); }
        finally { setDeleting(false); }
    };

    const handleCollabRequest = async () => {
        try {
            const res = await fetch("/api/collab", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: project.id,
                    toUserId: project.authorId,
                    message: collabMessage,
                }),
            });
            if (res.ok) {
                setCollabSent(true);
                setTimeout(() => { setShowCollabModal(false); setCollabSent(false); setCollabMessage(""); }, 1500);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <>
            <motion.div
                layout
                className="bg-surface border border-border rounded-card p-5 transition-all duration-200 hover:shadow-card-hover"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                    <Avatar name={project.author?.name || "User"} image={project.author?.image} size="md" />
                    <div className="flex-1 min-w-0">
                        <p className="text-card-title font-semibold text-text-primary truncate">{project.name}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-small text-text-muted truncate">{project.author?.name || "User"}</p>
                            {project.openToCollab && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded-pill">Collab</span>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-btn text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div initial={{ opacity: 0, y: -5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.95 }} className="absolute right-0 top-10 w-40 bg-surface border border-border rounded-card shadow-card-hover py-1 z-20">
                                        <button onClick={handleEdit} className="w-full text-left px-4 py-2 text-small text-text-secondary hover:bg-surface-alt flex items-center gap-2 transition-colors"><Edit3 size={14} /> Edit</button>
                                        <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-small text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"><Trash2 size={14} /> Delete</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Image */}
                {(project.imageUrl || project.thumbnail) && (
                    <div className="mb-3 rounded-card overflow-hidden border border-border">
                        <img src={project.imageUrl || project.thumbnail || ""} alt="" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                )}

                <p className="text-body text-text-secondary mb-3 line-clamp-2">{project.description}</p>

                {/* GitHub Link */}
                {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-3 px-3 py-2 bg-surface-alt rounded-card border border-border hover:border-text-muted transition-colors group text-small">
                        <Github size={14} className="text-text-primary" />
                        <span className="font-medium text-text-primary flex-1 truncate">{project.githubUrl.replace("https://github.com/", "")}</span>
                        <ExternalLink size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                )}

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-label px-2 py-0.5 rounded-pill bg-surface-alt text-text-secondary">{tag}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3">
                    <UpvoteButton count={project.upvotes} voted={false} onUpvote={onUpvote} />
                    <div className="flex items-center gap-2">
                        {project.openToCollab && !isOwner && session?.user && (
                            <button onClick={() => setShowCollabModal(true)} className="inline-flex items-center gap-1 text-label font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-pill hover:bg-green-200 transition-colors">
                                <Users size={11} /> Collab
                            </button>
                        )}
                        {project.xpThreshold > 0 && <ImpactXPBadge score={project.xpThreshold} size="sm" />}
                    </div>
                </div>
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowEditModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-surface rounded-card p-6 max-w-lg w-full shadow-modal relative max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={20} /></button>
                            <h2 className="font-display text-xl font-semibold text-text-primary mb-6 flex items-center gap-2"><Edit3 size={18} /> Edit Project</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Name</label>
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Description</label>
                                    <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all resize-none" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Tags <span className="text-text-muted">(comma separated)</span></label>
                                    <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5 flex items-center gap-2"><Github size={14} /> GitHub URL</label>
                                    <input type="url" value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="https://github.com/..." className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5 flex items-center gap-2"><ImageIcon size={14} /> Image URL</label>
                                    <input type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-card">
                                    <div>
                                        <p className="text-small font-medium text-text-primary">Open to Collaborate</p>
                                        <p className="text-label text-text-muted">Let others request to join</p>
                                    </div>
                                    <button type="button" onClick={() => setEditCollab(!editCollab)} className={`w-12 h-7 rounded-pill relative transition-colors ${editCollab ? "bg-success" : "bg-border"}`}>
                                        <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${editCollab ? "translate-x-5" : "translate-x-0.5"}`} />
                                    </button>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                    <Button variant="primary" onClick={handleSaveEdit} disabled={saving || !editName || !editDesc}>{saving ? "Saving..." : "Save"}</Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-surface rounded-card p-6 max-w-sm w-full shadow-modal text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><Trash2 size={24} className="text-red-500" /></div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete this project?</h3>
                            <p className="text-small text-text-muted mb-6">This cannot be undone.</p>
                            <div className="flex justify-center gap-3">
                                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                <button onClick={handleDelete} disabled={deleting} className={`px-4 py-2 bg-red-500 text-white rounded-btn font-medium text-small hover:bg-red-600 transition-colors ${deleting ? "opacity-50" : ""}`}>{deleting ? "Deleting..." : "Delete"}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collab Modal */}
            <AnimatePresence>
                {showCollabModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCollabModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-surface rounded-card p-6 max-w-md w-full shadow-modal" onClick={(e) => e.stopPropagation()}>
                            {collabSent ? (
                                <div className="text-center py-8">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"><Check size={32} className="text-green-600" /></div>
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-text-primary">Request Sent!</h3>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-display text-xl font-semibold text-text-primary mb-2 flex items-center gap-2"><Users size={18} /> Collaborate</h2>
                                    <p className="text-small text-text-muted mb-4">Request to collaborate on &quot;{project.name}&quot;</p>
                                    <textarea value={collabMessage} onChange={(e) => setCollabMessage(e.target.value)} placeholder="I'd love to work on this..." rows={3} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all resize-none mb-4" />
                                    <div className="flex justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setShowCollabModal(false)}>Cancel</Button>
                                        <Button variant="primary" onClick={handleCollabRequest}>Send Request</Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
