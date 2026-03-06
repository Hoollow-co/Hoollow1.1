"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown, Shield, Star, User } from "lucide-react";
import { AvatarStack } from "./Avatar";
import ImpactXPBadge from "./ImpactXPBadge";
import Button from "./Button";

interface ClubData {
    id: string;
    name: string;
    description: string;
    type: string;
    domain: string;
    gradient: string;
    tags: string[] | string;
    memberCount: number;
    members: { id: string; name: string; image: string; impactXP: number }[];
    impactXP: number;
    isMember?: boolean;
    currentUserRole?: string | null;
    featured?: boolean;
}

interface ClubCardProps {
    club: ClubData;
    onJoin?: () => void;
    className?: string;
}

const typeBadgeConfig: Record<string, { label: string; bg: string; text: string }> = {
    open: { label: "Open", bg: "bg-[#F0FFF4]", text: "text-success" },
    invite: { label: "Invite Only", bg: "bg-surface-alt", text: "text-text-secondary" },
    application: { label: "Application", bg: "bg-accent", text: "text-accent-inverse" },
};

const ROLE_ICON: Record<string, React.ReactNode> = {
    owner: <Crown size={10} className="text-yellow-500" />,
    coowner: <Shield size={10} className="text-purple-500" />,
    manager: <Star size={10} className="text-blue-500" />,
    member: <User size={10} className="text-text-muted" />,
};
const ROLE_LABEL: Record<string, string> = { owner: "Owner", coowner: "Co-Owner", manager: "Manager", member: "Member" };
const ROLE_COLORS: Record<string, string> = { owner: "bg-yellow-100 text-yellow-700", coowner: "bg-purple-100 text-purple-700", manager: "bg-blue-100 text-blue-700", member: "bg-gray-100 text-gray-700" };

export default function ClubCard({ club, onJoin, className = "" }: ClubCardProps) {
    const router = useRouter();
    const typeConfig = typeBadgeConfig[club.type] || typeBadgeConfig.open;
    const tags = Array.isArray(club.tags) ? club.tags : [];
    const memberNames = club.members?.map((m) => m.name || "User") || [];

    const handleClick = () => {
        router.push(`/clubs/${club.id}`);
    };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            onClick={handleClick}
            className={`bg-surface border border-border rounded-card overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-card-hover ${className}`}
        >
            {/* Banner */}
            <div className="w-full h-28 relative" style={{ background: club.gradient }}>
                {club.currentUserRole && (
                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-pill backdrop-blur-sm ${ROLE_COLORS[club.currentUserRole]}`}>
                        {ROLE_ICON[club.currentUserRole]} {ROLE_LABEL[club.currentUserRole]}
                    </span>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-card-title font-semibold text-text-primary">{club.name}</h3>
                    <ImpactXPBadge score={club.impactXP || 0} size="sm" showIcon={false} />
                </div>
                <p className="text-small text-text-secondary mb-3 line-clamp-2">{club.description}</p>

                <div className="flex items-center gap-3 mb-3">
                    {memberNames.length > 0 && <AvatarStack names={memberNames} />}
                    <span className="text-small text-text-muted">{club.memberCount} members</span>
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.map((tag: string) => (
                            <span key={tag} className="text-label px-2 py-0.5 rounded-pill bg-surface-alt text-text-secondary">{tag}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <span className={`text-label px-2.5 py-1 rounded-pill ${typeConfig.bg} ${typeConfig.text}`}>
                        {typeConfig.label}
                    </span>
                    {club.isMember ? (
                        <span className="text-label font-semibold text-success px-3 py-1.5">Joined ✓</span>
                    ) : (
                        <Button
                            variant={club.type === "open" ? "primary" : "ghost"}
                            size="sm"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onJoin?.(); }}
                        >
                            {club.type === "open" ? "Join" : "Apply"}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
