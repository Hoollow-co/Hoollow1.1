"use client";

import React from "react";
import { Zap } from "lucide-react";

interface ImpactXPBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showIcon?: boolean;
    className?: string;
}

export default function ImpactXPBadge({
    score,
    size = "sm",
    showIcon = true,
    className = "",
}: ImpactXPBadgeProps) {
    const sizeStyles = {
        sm: "text-[0.6875rem] px-2.5 py-1 gap-1",
        md: "text-[0.75rem] px-3 py-1.5 gap-1.5",
        lg: "text-[0.875rem] px-4 py-2 gap-2",
    };

    const iconSize = {
        sm: 10,
        md: 12,
        lg: 14,
    };

    return (
        <span
            className={`inline-flex items-center bg-accent text-accent-inverse font-semibold uppercase tracking-wider rounded-pill font-ui ${sizeStyles[size]} ${className}`}
        >
            {showIcon && <Zap size={iconSize[size]} fill="currentColor" />}
            {score.toLocaleString()} XP
        </span>
    );
}
