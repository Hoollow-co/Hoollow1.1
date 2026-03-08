"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Sparkles, Bell, MessageCircle } from "lucide-react";
import ImpactXPBadge from "./ImpactXPBadge";
import Avatar from "./Avatar";
import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const navLinks = [
    { href: "/feed", label: "Feed" },
    { href: "/launchpad", label: "Launchpad" },
    { href: "/clubs", label: "Clubs" },
    { href: "/collab", label: "Collab" },
    { href: "/super", label: "Super", premium: true },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const userName = session?.user?.name || "User";
    const userXP = session?.user?.impactXP || 0;
    const profileSlug = session?.user?.id || "me";

    const fetchUnread = useCallback(async () => {
        if (status !== "authenticated") return;
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setUnreadNotifications(data.unreadCount || 0);
            }
        } catch (e) { console.error(e); }
    }, [status]);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [fetchUnread]);

    // Track scroll for subtle shadow effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 5);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close profile menu on outside click
    useEffect(() => {
        const handleClick = () => setProfileMenuOpen(false);
        if (profileMenuOpen) {
            document.addEventListener("click", handleClick);
            return () => document.removeEventListener("click", handleClick);
        }
    }, [profileMenuOpen]);

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`sticky top-0 z-50 h-[60px] border-b border-white/15 bg-white/5 backdrop-blur-2xl backdrop-saturate-150 transition-shadow duration-300 ${scrolled ? "shadow-[0_18px_45px_rgba(0,0,0,0.85)]" : "shadow-[0_18px_45px_rgba(0,0,0,0.6)]"}`}
        >
            <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 group">
                    <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="font-display text-xl font-semibold text-text-primary"
                    >
                        Hoollow
                    </motion.span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-button font-medium transition-colors duration-200 relative py-[18px] ${pathname === link.href
                                ? "text-text-primary"
                                : "text-text-secondary hover:text-text-primary"
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                {link.label}
                                {link.premium && (
                                    <motion.span
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-[9px] font-bold uppercase tracking-wider bg-premium-soft text-premium px-1.5 py-0.5 rounded-pill"
                                    >
                                        Pro
                                    </motion.span>
                                )}
                            </span>
                            {pathname === link.href && (
                                <motion.span
                                    layoutId="navIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary rounded-full"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="hidden md:flex items-center gap-4">
                    {status === "authenticated" && session?.user ? (
                        <>
                            <div className="flex items-center gap-1 mr-2">
                                <Link href="/messages" className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-alt transition-colors relative">
                                    <MessageCircle size={20} />
                                </Link>
                                <Link href="/notifications" className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-alt transition-colors relative">
                                    <Bell size={20} />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface"></span>
                                    )}
                                </Link>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <ImpactXPBadge score={userXP} size="sm" />
                            </motion.div>
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen); }}
                                    className="focus:outline-none"
                                >
                                    <Avatar name={userName} image={session.user.image || ""} size="md" />
                                </motion.button>
                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-card shadow-card-hover py-2 z-50"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="px-4 py-2 border-b border-border">
                                                <p className="text-small font-semibold text-text-primary truncate">{userName}</p>
                                                <p className="text-label text-text-muted truncate">{session.user.email}</p>
                                            </div>
                                            <Link
                                                href={`/profile/${profileSlug}`}
                                                className="block px-4 py-2 text-small text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                View Profile
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: "/" })}
                                                className="w-full text-left px-4 py-2 text-small text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors flex items-center gap-2"
                                            >
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : status === "unauthenticated" ? (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                            className="text-button font-semibold bg-accent text-accent-inverse px-4 py-2 rounded-btn hover:bg-accent-hover transition-colors"
                        >
                            Sign In
                        </motion.button>
                    ) : null}
                </div>

                {/* Mobile menu button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="md:hidden p-2 text-text-primary"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <AnimatePresence mode="wait">
                        {mobileOpen ? (
                            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                <X size={20} />
                            </motion.div>
                        ) : (
                            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                <Menu size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden absolute top-[60px] left-0 right-0 bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.85)] z-50 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-3">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={link.href}
                                        className={`text-button font-medium py-2 block ${pathname === link.href ? "text-text-primary" : "text-text-secondary"}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span className="flex items-center gap-2">
                                            {link.label}
                                            {link.premium && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider bg-premium-soft text-premium px-1.5 py-0.5 rounded-pill">Pro</span>
                                            )}
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                            <div className="flex items-center gap-3 pt-3 border-t border-border">
                                {status === "authenticated" && session?.user ? (
                                    <>
                                        <ImpactXPBadge score={userXP} size="sm" />
                                        <Link href={`/profile/${profileSlug}`} onClick={() => setMobileOpen(false)}>
                                            <Avatar name={userName} size="md" />
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="ml-auto text-small text-text-muted hover:text-text-primary flex items-center gap-1"
                                        >
                                            <LogOut size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                                        className="text-button font-semibold bg-accent text-accent-inverse px-4 py-2 rounded-btn hover:bg-accent-hover transition-colors w-full text-center"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
