"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "premium" | "muted" | "white" | "white-outline";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export default function Button({
    variant = "primary",
    size = "md",
    children,
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out rounded-btn font-ui whitespace-nowrap";

    const sizeStyles = {
        sm: "text-[0.8125rem] px-4 py-2",
        md: "text-button px-6 py-3",
        lg: "text-button px-8 py-4",
    };

    const variantStyles = {
        primary:
            "bg-accent text-accent-inverse hover:bg-accent-hover hover:-translate-y-[1px] hover:shadow-btn-hover active:translate-y-0",
        ghost:
            "bg-transparent border-[1.5px] border-border text-text-primary hover:border-accent hover:bg-surface-alt",
        premium:
            "bg-premium text-white hover:bg-premium-hover hover:-translate-y-[1px] hover:shadow-btn-hover active:translate-y-0",
        muted:
            "bg-surface-alt text-text-secondary hover:bg-border",
        white:
            "bg-white text-accent hover:bg-surface-alt hover:-translate-y-[1px] hover:shadow-btn-hover active:translate-y-0",
        "white-outline":
            "bg-transparent border-[1.5px] border-white/30 text-white hover:border-white hover:bg-white/10",
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
