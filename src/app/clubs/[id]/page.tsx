"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageCircle,
    Users,
    Settings,
    Send,
    Crown,
    Shield,
    Star,
    User,
    ChevronLeft,
    MoreVertical,
    LogOut,
    X,
    Check,
    Trash2,
    UserPlus,
    Mail,
    Search,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";

interface ClubMember {
    id: string;
    role: string;
    joinedAt: string;
    user: { id: string; name: string; image: string; role: string; impactXP: number };
}

interface ClubDetail {
    id: string;
    name: string;
    description: string;
    type: string;
    domain: string;
    gradient: string;
    tags: string[];
    creatorId: string;
    memberCount: number;
    messageCount: number;
    members: ClubMember[];
    currentUserRole: string | null;
    isMember: boolean;
    createdAt: string;
}

interface ChatMessage {
    id: string;
    text: string;
    createdAt: string;
    author: { id: string; name: string; image: string; role: string };
}

const ROLE_ICON: Record<string, React.ReactNode> = {
    owner: <Crown size={12} className="text-yellow-500" />,
    coowner: <Shield size={12} className="text-purple-500" />,
    manager: <Star size={12} className="text-blue-500" />,
    member: <User size={12} className="text-text-muted" />,
};

const ROLE_LABEL: Record<string, string> = {
    owner: "Owner",
    coowner: "Co-Owner",
    manager: "Manager",
    member: "Member",
};

const ROLE_LEVEL: Record<string, number> = { owner: 4, coowner: 3, manager: 2, member: 1 };

const ROLE_COLORS: Record<string, string> = {
    owner: "bg-yellow-100 text-yellow-700",
    coowner: "bg-purple-100 text-purple-700",
    manager: "bg-blue-100 text-blue-700",
    member: "bg-gray-100 text-gray-700",
};

export default function ClubDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const clubId = params.id as string;

    const [club, setClub] = useState<ClubDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"chat" | "members" | "invitations" | "settings">("chat");

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageText, setMessageText] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    // Settings state
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editType, setEditType] = useState("open");
    const [editDomain, setEditDomain] = useState("Tech");
    const [savingSettings, setSavingSettings] = useState(false);

    // Member action state
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

    // Invite state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSearch, setInviteSearch] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: string; name: string; image: string }[]>([]);
    const [inviting, setInviting] = useState(false);
    const [sentInvites, setSentInvites] = useState<any[]>([]);
    const [receivedInvites, setReceivedInvites] = useState<any[]>([]);

    const fetchClub = useCallback(async () => {
        try {
            const res = await fetch(`/api/clubs/${clubId}`);
            if (res.ok) {
                const data = await res.json();
                setClub(data);
                setEditName(data.name);
                setEditDesc(data.description);
                setEditType(data.type);
                setEditDomain(data.domain);
            } else {
                router.push("/clubs");
            }
        } catch {
            router.push("/clubs");
        } finally {
            setLoading(false);
        }
    }, [clubId, router]);

    const fetchMessages = useCallback(async () => {
        if (!club?.isMember) return;
        try {
            const res = await fetch(`/api/clubs/${clubId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (e) { console.error(e); }
    }, [clubId, club?.isMember]);

    useEffect(() => {
        fetchClub();
    }, [fetchClub]);

    useEffect(() => {
        if (club?.isMember && activeTab === "chat") {
            fetchMessages();
            // Poll every 3 seconds for new messages
            pollRef.current = setInterval(fetchMessages, 3000);
            return () => { if (pollRef.current) clearInterval(pollRef.current); };
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [club?.isMember, activeTab, fetchMessages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        setSendingMessage(true);
        try {
            const res = await fetch(`/api/clubs/${clubId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: messageText }),
            });
            if (res.ok) {
                const msg = await res.json();
                setMessages((prev) => [...prev, msg]);
                setMessageText("");
            }
        } catch (e) { console.error(e); }
        finally { setSendingMessage(false); }
    };

    const handleJoinLeave = async () => {
        try {
            await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
            fetchClub();
        } catch (e) { console.error(e); }
    };

    const handleChangeRole = async (memberId: string, newRole: string) => {
        try {
            await fetch(`/api/clubs/${clubId}/members`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId, newRole }),
            });
            fetchClub();
            setActiveMemberId(null);
        } catch (e) { console.error(e); }
    };

    const handleKick = async (memberId: string) => {
        try {
            await fetch(`/api/clubs/${clubId}/members?memberId=${memberId}`, { method: "DELETE" });
            fetchClub();
            setActiveMemberId(null);
        } catch (e) { console.error(e); }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await fetch(`/api/clubs/${clubId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, description: editDesc, type: editType, domain: editDomain }),
            });
            fetchClub();
        } catch (e) { console.error(e); }
        finally { setSavingSettings(false); }
    };

    const handleDeleteClub = async () => {
        if (!confirm("Are you sure you want to delete this club? This cannot be undone.")) return;
        try {
            await fetch(`/api/clubs/${clubId}`, { method: "DELETE" });
            router.push("/clubs");
        } catch (e) { console.error(e); }
    };

    const fetchInvitations = useCallback(async () => {
        try {
            const res = await fetch(`/api/clubs/${clubId}/invitations`);
            if (res.ok) {
                const data = await res.json();
                setSentInvites(data.sent || []);
                setReceivedInvites(data.received || []);
            }
        } catch (e) { console.error(e); }
    }, [clubId]);

    useEffect(() => {
        if (club?.isMember) fetchInvitations();
    }, [club?.isMember, fetchInvitations]);

    const handleSearchUsers = async (query: string) => {
        setInviteSearch(query);
        if (query.length < 2) { setSearchResults([]); return; }
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) setSearchResults(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleInviteUser = async (toUserId: string) => {
        setInviting(true);
        try {
            const res = await fetch(`/api/clubs/${clubId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUserId }),
            });
            if (res.ok) {
                fetchInvitations();
                setShowInviteModal(false);
                setInviteSearch("");
                setSearchResults([]);
            }
        } catch (e) { console.error(e); }
        finally { setInviting(false); }
    };

    const handleRespondInvite = async (invitationId: string, status: string) => {
        try {
            await fetch(`/api/clubs/${clubId}/invitations`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitationId, status }),
            });
            fetchInvitations();
            if (status === "accepted") fetchClub();
        } catch (e) { console.error(e); }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full" />
                </div>
            </>
        );
    }

    if (!club) return null;

    const myRole = club.currentUserRole;
    const myLevel = myRole ? ROLE_LEVEL[myRole] || 0 : 0;
    const canManageMembers = myLevel >= ROLE_LEVEL.manager;
    const canEditSettings = myLevel >= ROLE_LEVEL.coowner;
    const isOwner = myRole === "owner";

    const tabs = [
        { key: "chat" as const, label: "Chat", icon: <MessageCircle size={16} />, count: club.messageCount },
        { key: "members" as const, label: "Members", icon: <Users size={16} />, count: club.memberCount },
        ...(canManageMembers ? [{ key: "invitations" as const, label: "Invitations", icon: <Mail size={16} />, count: sentInvites.filter((i: any) => i.status === "pending").length + receivedInvites.length }] : []),
        ...(canEditSettings ? [{ key: "settings" as const, label: "Settings", icon: <Settings size={16} /> }] : []),
    ];

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Hero header */}
                <div className="relative" style={{ background: club.gradient }}>
                    <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
                        <button onClick={() => router.push("/clubs")} className="inline-flex items-center gap-1 text-white/80 hover:text-white text-small mb-4 transition-colors">
                            <ChevronLeft size={16} /> Back to Clubs
                        </button>
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{club.name}</h1>
                                <p className="text-white/80 text-body max-w-xl">{club.description}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-white/70 text-small">{club.memberCount} members</span>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/70 text-small capitalize">{club.type} club</span>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/70 text-small">{club.domain}</span>
                                    {myRole && (
                                        <>
                                            <span className="text-white/40">•</span>
                                            <span className="inline-flex items-center gap-1 text-white text-small font-medium">
                                                {ROLE_ICON[myRole]} {ROLE_LABEL[myRole]}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                {!club.isMember ? (
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleJoinLeave} className="px-6 py-2.5 bg-white text-gray-900 rounded-pill font-semibold text-small hover:bg-white/90 transition-colors shadow-lg">
                                        Join Club
                                    </motion.button>
                                ) : !isOwner ? (
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleJoinLeave} className="px-6 py-2.5 bg-white/20 text-white rounded-pill font-semibold text-small hover:bg-white/30 transition-colors backdrop-blur-sm flex items-center gap-2">
                                        <LogOut size={14} /> Leave
                                    </motion.button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {!club.isMember ? (
                    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-surface-alt rounded-full flex items-center justify-center">
                            <Users size={32} className="text-text-muted" />
                        </div>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">Join to participate</h2>
                        <p className="text-text-muted mb-6">Join this club to access the group chat, see members, and collaborate.</p>
                        <Button variant="primary" onClick={handleJoinLeave}>Join Club</Button>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto px-4 py-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 mb-6 border-b border-border">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative flex items-center gap-2 px-4 py-3 text-small font-medium transition-colors ${activeTab === tab.key ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className="text-label bg-surface-alt px-1.5 py-0.5 rounded-pill">{tab.count}</span>
                                    )}
                                    {activeTab === tab.key && (
                                        <motion.span layoutId="clubTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary rounded-full" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ─── Chat Tab ─── */}
                        <AnimatePresence mode="wait">
                            {activeTab === "chat" && (
                                <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-surface border border-border rounded-card overflow-hidden" style={{ height: "calc(100vh - 350px)", minHeight: "400px" }}>
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {messages.length === 0 ? (
                                                <div className="flex-1 flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <MessageCircle size={40} className="text-text-muted mx-auto mb-3 opacity-30" />
                                                        <p className="text-text-muted text-small">No messages yet. Start the conversation!</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                messages.map((msg, i) => {
                                                    const isMe = msg.author.id === session?.user?.id;
                                                    const showAvatar = i === 0 || messages[i - 1].author.id !== msg.author.id;
                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            initial={{ opacity: 0, y: 5 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
                                                        >
                                                            {showAvatar ? (
                                                                <Avatar name={msg.author.name} image={msg.author.image} size="sm" />
                                                            ) : (
                                                                <div className="w-8" />
                                                            )}
                                                            <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                                                {showAvatar && (
                                                                    <p className={`text-label font-medium mb-0.5 ${isMe ? "text-right" : ""} text-text-primary`}>
                                                                        {msg.author.name}
                                                                    </p>
                                                                )}
                                                                <div className={`px-3.5 py-2.5 rounded-2xl text-small ${isMe
                                                                    ? "bg-accent text-accent-inverse rounded-br-md"
                                                                    : "bg-surface-alt text-text-primary rounded-bl-md"
                                                                    }`}>
                                                                    {msg.text}
                                                                </div>
                                                                <p className={`text-[10px] text-text-muted mt-0.5 ${isMe ? "text-right" : ""}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <div className="p-3 border-t border-border bg-surface">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={messageText}
                                                    onChange={(e) => setMessageText(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                                    placeholder="Type a message..."
                                                    className="flex-1 px-4 py-2.5 bg-surface-alt border border-border rounded-pill text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                                />
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSendMessage}
                                                    disabled={!messageText.trim() || sendingMessage}
                                                    className="w-10 h-10 bg-accent text-accent-inverse rounded-full flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50"
                                                >
                                                    <Send size={16} />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── Members Tab ─── */}
                            {activeTab === "members" && (
                                <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="space-y-2">
                                        {club.members.map((m) => {
                                            const memberLevel = ROLE_LEVEL[m.role] || 0;
                                            const canActOn = canManageMembers && memberLevel < myLevel && m.user.id !== session?.user?.id;

                                            return (
                                                <motion.div
                                                    key={m.id}
                                                    layout
                                                    className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card hover:shadow-card-hover transition-all"
                                                >
                                                    <Avatar name={m.user.name} image={m.user.image} size="md" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-small font-semibold text-text-primary truncate">{m.user.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill ${ROLE_COLORS[m.role] || "bg-gray-100 text-gray-700"}`}>
                                                                {ROLE_ICON[m.role]} {ROLE_LABEL[m.role] || m.role}
                                                            </span>
                                                            <span className="text-label text-text-muted">{m.user.impactXP} XP</span>
                                                        </div>
                                                    </div>
                                                    {canActOn && (
                                                        <div className="relative">
                                                            <button onClick={() => setActiveMemberId(activeMemberId === m.id ? null : m.id)} className="p-2 rounded-btn text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors">
                                                                <MoreVertical size={16} />
                                                            </button>
                                                            <AnimatePresence>
                                                                {activeMemberId === m.id && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                        className="absolute right-0 top-10 w-44 bg-surface border border-border rounded-card shadow-card-hover py-1 z-20"
                                                                    >
                                                                        <p className="px-3 py-1.5 text-label text-text-muted font-medium uppercase tracking-wider">Change Role</p>
                                                                        {Object.entries(ROLE_LABEL)
                                                                            .filter(([role]) => ROLE_LEVEL[role] < myLevel && role !== m.role)
                                                                            .map(([role, label]) => (
                                                                                <button key={role} onClick={() => handleChangeRole(m.id, role)} className="w-full text-left px-3 py-2 text-small text-text-secondary hover:bg-surface-alt flex items-center gap-2 transition-colors">
                                                                                    {ROLE_ICON[role]} {label}
                                                                                </button>
                                                                            ))
                                                                        }
                                                                        <div className="border-t border-border my-1" />
                                                                        <button onClick={() => handleKick(m.id)} className="w-full text-left px-3 py-2 text-small text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                                                                            <Trash2 size={14} /> Kick
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── Invitations Tab ─── */}
                            {activeTab === "invitations" && canManageMembers && (
                                <motion.div key="invitations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    {/* Invite User Button */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-text-primary">Club Invitations</h3>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowInviteModal(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-inverse rounded-btn font-medium text-small hover:bg-accent-hover transition-colors"
                                        >
                                            <UserPlus size={14} /> Invite User
                                        </motion.button>
                                    </div>

                                    {/* Received Invitations */}
                                    {receivedInvites.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-small font-medium text-text-muted uppercase tracking-wider mb-2">Received</h4>
                                            <div className="space-y-2">
                                                {receivedInvites.map((inv: any) => (
                                                    <div key={inv.id} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card">
                                                        <Avatar name={inv.fromUser.name} image={inv.fromUser.image} size="sm" />
                                                        <div className="flex-1">
                                                            <p className="text-small text-text-primary"><strong>{inv.fromUser.name}</strong> invited you to join <strong>{inv.club?.name}</strong></p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleRespondInvite(inv.id, "accepted")} className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"><Check size={14} /></button>
                                                            <button onClick={() => handleRespondInvite(inv.id, "rejected")} className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"><X size={14} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sent Invitations */}
                                    <div>
                                        <h4 className="text-small font-medium text-text-muted uppercase tracking-wider mb-2">Sent</h4>
                                        {sentInvites.length === 0 ? (
                                            <div className="text-center py-8 bg-surface border border-border rounded-card">
                                                <Mail size={32} className="text-text-muted mx-auto mb-2 opacity-30" />
                                                <p className="text-small text-text-muted">No invitations sent yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {sentInvites.map((inv: any) => (
                                                    <div key={inv.id} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-card">
                                                        <Avatar name={inv.toUser.name} image={inv.toUser.image} size="sm" />
                                                        <div className="flex-1">
                                                            <p className="text-small font-medium text-text-primary">{inv.toUser.name}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-pill ${inv.status === "pending" ? "bg-yellow-100 text-yellow-700"
                                                            : inv.status === "accepted" ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                            }`}>{inv.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── Settings Tab ─── */}
                            {activeTab === "settings" && canEditSettings && (
                                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg">
                                    <div className="bg-surface border border-border rounded-card p-6 space-y-5">
                                        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2"><Settings size={18} /> Club Settings</h3>
                                        <div>
                                            <label className="text-small font-medium text-text-primary block mb-1.5">Name</label>
                                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-small font-medium text-text-primary block mb-1.5">Description</label>
                                            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all resize-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-small font-medium text-text-primary block mb-1.5">Type</label>
                                                <select value={editType} onChange={(e) => setEditType(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all">
                                                    <option value="open">Open</option>
                                                    <option value="invite">Invite Only</option>
                                                    <option value="application">Application</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-small font-medium text-text-primary block mb-1.5">Domain</label>
                                                <select value={editDomain} onChange={(e) => setEditDomain(e.target.value)} className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary focus:outline-none focus:border-accent transition-all">
                                                    <option value="Tech">Tech</option>
                                                    <option value="Design">Design</option>
                                                    <option value="Business">Business</option>
                                                    <option value="Research">Research</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            {isOwner && (
                                                <button onClick={handleDeleteClub} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-btn text-small font-medium flex items-center gap-2 transition-colors">
                                                    <Trash2 size={14} /> Delete Club
                                                </button>
                                            )}
                                            <div className="flex gap-3 ml-auto">
                                                <Button variant="primary" onClick={handleSaveSettings} disabled={savingSettings}>{savingSettings ? "Saving..." : "Save Changes"}</Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Invite User Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowInviteModal(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-surface rounded-card p-6 max-w-md w-full shadow-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-display text-xl font-semibold text-text-primary flex items-center gap-2"><UserPlus size={18} /> Invite User</h2>
                                <button onClick={() => setShowInviteModal(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
                            </div>
                            <div className="relative mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    value={inviteSearch}
                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                    placeholder="Search by name..."
                                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                                {searchResults.length === 0 && inviteSearch.length >= 2 && (
                                    <p className="text-center py-4 text-small text-text-muted">No users found</p>
                                )}
                                {searchResults.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleInviteUser(u.id)}
                                        disabled={inviting}
                                        className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-surface-alt transition-colors text-left"
                                    >
                                        <Avatar name={u.name} image={u.image} size="sm" />
                                        <span className="text-small font-medium text-text-primary flex-1">{u.name}</span>
                                        <span className="text-label text-accent font-semibold">Invite</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
