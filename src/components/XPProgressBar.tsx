"use client";

import React, { useEffect, useState } from "react";

interface XPProgressBarProps {
    current: number;
    max: number;
    className?: string;
    animate?: boolean;
}

export default function XPProgressBar({
    current,
    max,
    className = "",
    animate = true,
}: XPProgressBarProps) {
    const [width, setWidth] = useState(animate ? 0 : (current / max) * 100);

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => {
                setWidth((current / max) * 100);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [current, max, animate]);

    return (
        <div className={`w-full ${className}`}>
            <div className="w-full h-[6px] bg-surface-alt rounded-pill overflow-hidden">
                <div
                    className="h-full rounded-pill transition-all duration-600 ease-out"
                    style={{
                        width: `${Math.min(width, 100)}%`,
                        background: "linear-gradient(90deg, #0F0F0F, #555555)",
                        transitionDuration: "600ms",
                    }}
                />
            </div>
            <div className="flex justify-between mt-1.5">
                <span className="text-small text-text-secondary">
                    {current.toLocaleString()} XP
                </span>
                <span className="text-small text-text-muted">
                    {max.toLocaleString()} XP
                </span>
            </div>
        </div>
    );
}
