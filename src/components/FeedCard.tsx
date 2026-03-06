"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageCircle,
    Share2,
    Bookmark,
    ExternalLink,
    Send,
    Edit3,
    X,
    Check,
    MoreHorizontal,
    Trash2,
    Users,
    Image as ImageIcon,
} from "lucide-react";
import Avatar from "./Avatar";
import ImpactXPBadge from "./ImpactXPBadge";
import UpvoteButton from "./UpvoteButton";
import Button from "./Button";
import { getTimeAgo } from "@/lib/mockData";
import { useSession } from "next-auth/react";

interface PostAuthor {
    id: string;
    name: string;
    image: string;
    role: string;
    impactXP: number;
}

interface PostData {
    id: string;
    title: string;
    body: string;
    tags: string[] | string;
    upvotes: number;
    authorId: string;
    author: PostAuthor;
    createdAt: string;
    commentCount: number;
    isProject?: boolean;
    hasUpvoted?: boolean;
    imageUrl?: string | null;
    openToCollab?: boolean;
}

interface CommentData {
    id: string;
    text: string;
    author: PostAuthor;
    createdAt: string;
}

interface FeedCardProps {
    post: PostData;
    onUpvote?: () => void;
    onPostUpdated?: () => void;
    className?: string;
}

export default function FeedCard({ post, onUpvote, onPostUpdated, className = "" }: FeedCardProps) {
    const { data: session } = useSession();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [shared, setShared] = useState(false);
    const [collabMessage, setCollabMessage] = useState("");
    const [collabSent, setCollabSent] = useState(false);

    // Optimistic upvote state
    const [voted, setVoted] = useState(post.hasUpvoted || false);
    const [voteCount, setVoteCount] = useState(post.upvotes);

    // Edit state
    const [editTitle, setEditTitle] = useState(post.title);
    const [editBody, setEditBody] = useState(post.body);
    const [editTags, setEditTags] = useState(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || "");
    const [editCollab, setEditCollab] = useState(post.openToCollab || false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const tags = Array.isArray(post.tags) ? post.tags : [];
    const isOwner = session?.user?.id === post.authorId;

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/comments`);
            if (res.ok) setComments(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoadingComments(false); }
    };

    const handleToggleComments = () => {
        if (!showComments) fetchComments();
        setShowComments(!showComments);
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        try {
            const res = await fetch(`/api/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: commentText }),
            });
            if (res.ok) {
                setComments([...comments, await res.json()]);
                setCommentText("");
            }
        } catch (e) { console.error(e); }
    };

    const handleEdit = () => {
        setEditTitle(post.title);
        setEditBody(post.body);
        setEditTags(Array.isArray(post.tags) ? post.tags.join(", ") : "");
        setEditImageUrl(post.imageUrl || "");
        setEditCollab(post.openToCollab || false);
        setShowEditModal(true);
        setShowMenu(false);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/posts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: post.id,
                    title: editTitle,
                    body: editBody,
                    tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                    imageUrl: editImageUrl || null,
                    openToCollab: editCollab,
                }),
            });
            if (res.ok) { setShowEditModal(false); onPostUpdated?.(); }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/posts?id=${post.id}`, { method: "DELETE" });
            if (res.ok) { setShowDeleteConfirm(false); onPostUpdated?.(); }
        } catch (e) { console.error(e); }
        finally { setDeleting(false); }
    };

    const handleCollabRequest = async () => {
        try {
            const res = await fetch("/api/collab", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    postId: post.id,
                    toUserId: post.authorId,
                    message: collabMessage,
                }),
            });
            if (res.ok) {
                setCollabSent(true);
                setTimeout(() => { setShowCollabModal(false); setCollabSent(false); setCollabMessage(""); }, 1500);
            }
        } catch (e) { console.error(e); }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/feed#${post.id}`);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
    };

    return (
        <>
            <motion.article
                layout
                className={`bg-surface border border-border rounded-card p-5 md:p-6 transition-all duration-200 hover:shadow-card-hover ${className}`}
            >
                {/* Author row */}
                <div className="flex items-center gap-3 mb-4">
                    <Avatar name={post.author.name || "User"} image={post.author.image} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-text-primary text-[0.9375rem]">{post.author.name || "User"}</span>
                            <ImpactXPBadge score={post.author.impactXP} size="sm" showIcon={false} />
                            {post.openToCollab && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded-pill">
                                    Open to Collab
                                </span>
                            )}
                        </div>
                        <span className="text-small text-text-muted">{getTimeAgo(post.createdAt)}</span>
                    </div>
                    {isOwner && (
                        <div className="relative">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 rounded-btn text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
                            >
                                <MoreHorizontal size={16} />
                            </motion.button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                        className="absolute right-0 top-10 w-40 bg-surface border border-border rounded-card shadow-card-hover py-1 z-20"
                                    >
                                        <button onClick={handleEdit} className="w-full text-left px-4 py-2 text-small text-text-secondary hover:bg-surface-alt hover:text-text-primary flex items-center gap-2 transition-colors">
                                            <Edit3 size={14} /> Edit Post
                                        </button>
                                        <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-small text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                            <Trash2 size={14} /> Delete Post
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <h3 className="text-card-title font-semibold text-text-primary mb-2">{post.title}</h3>
                <p className="text-body text-text-secondary mb-4 whitespace-pre-wrap">{post.body}</p>

                {/* Image */}
                {post.imageUrl && (
                    <div className="mb-4 rounded-card overflow-hidden border border-border">
                        <img src={post.imageUrl} alt="" className="w-full max-h-80 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag: string) => (
                            <span key={tag} className="text-label px-2.5 py-1 rounded-pill bg-surface-alt text-text-secondary">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                        <UpvoteButton count={voteCount} voted={voted} onUpvote={async () => {
                            // Optimistic update
                            setVoted(!voted);
                            setVoteCount(voted ? voteCount - 1 : voteCount + 1);
                            try {
                                await fetch(`/api/posts/${post.id}/upvote`, { method: "POST" });
                                // Re-fetch to get true server state
                                onUpvote?.();
                            } catch {
                                // Revert on error
                                setVoted(voted);
                                setVoteCount(voteCount);
                            }
                        }} />
                        <motion.button whileTap={{ scale: 0.9 }} onClick={handleToggleComments} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-btn transition-colors ${showComments ? "bg-surface-alt text-text-primary" : "text-text-muted hover:text-text-secondary hover:bg-surface-alt"}`}>
                            <MessageCircle size={16} />
                            <span className="text-small font-medium">{post.commentCount}</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors">
                            {shared ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBookmarked(!bookmarked)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-btn transition-colors ${bookmarked ? "text-premium bg-premium-soft" : "text-text-muted hover:text-text-secondary hover:bg-surface-alt"}`}>
                            <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
                        </motion.button>
                    </div>
                    <div className="flex items-center gap-2">
                        {post.openToCollab && !isOwner && session?.user && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCollabModal(true)}
                                className="inline-flex items-center gap-1.5 text-small font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-pill hover:bg-green-200 transition-colors"
                            >
                                <Users size={12} /> Collaborate
                            </motion.button>
                        )}
                        {post.isProject && (
                            <button className="inline-flex items-center gap-1.5 text-small font-semibold text-text-primary bg-surface-alt px-3 py-1.5 rounded-pill hover:bg-border transition-colors">
                                <ExternalLink size={12} /> Launchpad
                            </button>
                        )}
                    </div>
                </div>

                {/* Comments */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-4 pt-4 border-t border-border">
                                {loadingComments ? (
                                    <div className="flex items-center gap-2 text-small text-text-muted"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />Loading...</div>
                                ) : (
                                    <div className="space-y-3 mb-4">
                                        {comments.length === 0 ? <p className="text-small text-text-muted text-center py-3">No comments yet</p> : comments.map((c, i) => (
                                            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-3">
                                                <Avatar name={c.author.name || "User"} image={c.author.image} size="sm" />
                                                <div className="flex-1 bg-surface-alt rounded-btn p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-small font-semibold text-text-primary">{c.author.name || "User"}</span>
                                                        <span className="text-label text-text-muted">{getTimeAgo(c.createdAt)}</span>
                                                    </div>
                                                    <p className="text-small text-text-secondary">{c.text}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment()} placeholder="Add a comment..." className="flex-1 px-3 py-2 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors" />
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddComment} disabled={!commentText.trim()} className="px-3 py-2 bg-accent text-accent-inverse rounded-btn hover:bg-accent-hover transition-colors disabled:opacity-50"><Send size={14} /></motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.article>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowEditModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25 }} className="bg-surface rounded-card p-6 max-w-lg w-full shadow-modal relative max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={20} /></button>
                            <h2 className="font-display text-xl font-semibold text-text-primary mb-6 flex items-center gap-2"><Edit3 size={18} /> Edit Post</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Title</label>
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Body</label>
                                    <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={5} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all resize-none" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5">Tags <span className="text-text-muted">(comma separated)</span></label>
                                    <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div>
                                    <label className="text-small font-medium text-text-primary block mb-1.5 flex items-center gap-2"><ImageIcon size={14} /> Image URL</label>
                                    <input type="url" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-surface-alt rounded-card">
                                    <div>
                                        <p className="text-small font-medium text-text-primary">Open to Collaborate</p>
                                        <p className="text-label text-text-muted">Let others request to collab</p>
                                    </div>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditCollab(!editCollab)} className={`w-12 h-7 rounded-pill relative transition-colors ${editCollab ? "bg-success" : "bg-border"}`}>
                                        <motion.div animate={{ x: editCollab ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow" />
                                    </motion.button>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                    <Button variant="primary" onClick={handleSaveEdit} disabled={saving || !editTitle || !editBody} className={saving ? "opacity-50" : ""}>{saving ? "Saving..." : "Save Changes"}</Button>
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
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete this post?</h3>
                            <p className="text-small text-text-muted mb-6">This action cannot be undone. All comments and upvotes will be lost.</p>
                            <div className="flex justify-center gap-3">
                                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                <button onClick={handleDelete} disabled={deleting} className={`px-4 py-2 bg-red-500 text-white rounded-btn font-medium text-small hover:bg-red-600 transition-colors ${deleting ? "opacity-50" : ""}`}>{deleting ? "Deleting..." : "Delete"}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collab Request Modal */}
            <AnimatePresence>
                {showCollabModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCollabModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-surface rounded-card p-6 max-w-md w-full shadow-modal" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowCollabModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={20} /></button>
                            {collabSent ? (
                                <div className="text-center py-8">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"><Check size={32} className="text-green-600" /></div>
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-text-primary">Request Sent!</h3>
                                    <p className="text-small text-text-muted mt-1">{post.author.name} will be notified</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-display text-xl font-semibold text-text-primary mb-2 flex items-center gap-2"><Users size={18} /> Collaborate</h2>
                                    <p className="text-small text-text-muted mb-4">Send a collaboration request to <strong>{post.author.name}</strong> for &quot;{post.title}&quot;</p>
                                    <textarea value={collabMessage} onChange={(e) => setCollabMessage(e.target.value)} placeholder="Hey! I'd love to work on this with you..." rows={3} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all resize-none mb-4" />
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
