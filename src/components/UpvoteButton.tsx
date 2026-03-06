"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface UpvoteButtonProps {
    count: number;
    voted?: boolean;
    onUpvote?: () => void;
    className?: string;
}

/**
 * Fully-controlled upvote button.
 * All state lives in the parent — no local useState that can drift.
 * The parent handles optimistic updates + API calls.
 */
export default function UpvoteButton({
    count,
    voted = false,
    onUpvote,
    className = "",
}: UpvoteButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.stopPropagation();
                onUpvote?.();
            }}
            className={`inline-flex flex-col items-center gap-0.5 px-3 py-2 rounded-btn transition-all duration-200 ease-out ${voted
                ? "bg-accent/10 text-accent"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-alt"
                } ${className}`}
        >
            <motion.div
                key={voted ? "voted" : "not-voted"}
                initial={{ y: voted ? -3 : 0, scale: voted ? 1.3 : 1 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
                <ChevronUp
                    size={18}
                    className={voted ? "text-accent" : ""}
                    strokeWidth={voted ? 3 : 2}
                />
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.span
                    key={count}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -5, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className={`text-small font-semibold tabular-nums ${voted ? "text-accent" : "text-text-secondary"}`}
                >
                    {count}
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}
