"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    Bot,
    Settings,
    Users,
    Download,
    Send,
    Lock,
    X,
    Crown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import ImpactXPBadge from "@/components/ImpactXPBadge";
import Button from "@/components/Button";
import { useSession } from "next-auth/react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface Message {
    id: string;
    type: "human" | "ai";
    author: string;
    authorXP?: number;
    content: string;
    timestamp: string;
}

const mockMessages: Message[] = [
    {
        id: "m1",
        type: "human",
        author: "Ayush Kumar",
        authorXP: 2140,
        content:
            "What are the most effective strategies for validating a B2B SaaS idea before writing a single line of code?",
        timestamp: "2 min ago",
    },
    {
        id: "m2",
        type: "ai",
        author: "Super AI",
        content:
            "Great question! Here are 5 proven pre-code validation strategies:\n\n1. **Problem Interviews** — Talk to 20+ potential users. Focus on understanding their pain, not pitching your solution.\n\n2. **Concierge MVP** — Deliver the value manually first. If people pay for a spreadsheet-based version, they'll pay for the automated one.\n\n3. **Landing Page Test** — Create a landing page with your value prop and measure email sign-ups. Aim for 10%+ conversion.\n\n4. **Competitor Analysis** — Study existing solutions. Look for complaints in their reviews — that's where your opportunity is.\n\n5. **Pre-sell** — Offer early access at a discount. If 5+ people pay before the product exists, you've validated demand.",
        timestamp: "1 min ago",
    },
    {
        id: "m3",
        type: "human",
        author: "Priya Sharma",
        authorXP: 1840,
        content:
            "I'd add: join the communities where your target users hang out. Reddit, Discord, Slack groups. Listen before you build. The best SaaS ideas come from hearing the same complaint from 10+ people.",
        timestamp: "30s ago",
    },
    {
        id: "m4",
        type: "ai",
        author: "Super AI",
        content:
            'Excellent point, Priya! Community immersion is often overlooked. To quantify this: builders who validate through community research are **3x more likely** to find product-market fit within the first year. Would you like me to create a structured validation framework combining all these approaches?',
        timestamp: "Just now",
    },
];

export default function SuperPage() {
    const { data: session } = useSession();
    const [showPaywall, setShowPaywall] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [checkingSubscription, setCheckingSubscription] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Check if user has an active subscription
    useEffect(() => {
        async function checkSubscription() {
            try {
                const res = await fetch("/api/payment/status");
                if (res.ok) {
                    const data = await res.json();
                    if (data.hasSubscription) {
                        setShowPaywall(false);
                    }
                }
            } catch (e) {
                console.error("Failed to check subscription", e);
            } finally {
                setCheckingSubscription(false);
            }
        }
        checkSubscription();
    }, []);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSubscribe = async () => {
        setProcessing(true);
        try {
            // Step 1: Create order on server
            const orderRes = await fetch("/api/payment/create-order", { method: "POST" });
            if (!orderRes.ok) {
                alert("Failed to create payment order. Please ensure Razorpay keys are configured.");
                setProcessing(false);
                return;
            }
            const orderData = await orderRes.json();

            // Step 2: Open Razorpay checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Hoollow",
                description: "Super Environment — Monthly Subscription",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    // Step 3: Verify payment
                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                    if (verifyRes.ok) {
                        setShowPaywall(false);
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                },
                theme: {
                    color: "#8B5CF6",
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function () {
                alert("Payment failed. Please try again.");
                setProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment error:", error);
            alert("Something went wrong. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen relative" style={{ background: "#1A1025" }}>
                {/* ─── Header ─── */}
                <div className="border-b border-white/10 px-6 py-4">
                    <div className="max-w-content mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-label px-3 py-1.5 rounded-pill bg-premium text-white font-semibold">
                                <Sparkles size={12} />
                                Super Environment
                            </span>
                            <span className="text-label text-white/40">Premium Feature</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-small text-white/60">
                                Session: B2B SaaS Validation Strategies
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Main Area ─── */}
                <div className="max-w-content mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 min-h-[calc(100vh-180px)]">
                        {/* Left — Thread */}
                        <div className="flex flex-col">
                            <div className="flex-1 space-y-4 mb-6">
                                {mockMessages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded-card p-5 ${msg.type === "ai"
                                            ? "bg-premium/10 border border-premium/30"
                                            : "bg-white/5 border border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            {msg.type === "ai" ? (
                                                <div className="w-8 h-8 rounded-full bg-premium flex items-center justify-center">
                                                    <Bot size={16} className="text-white" />
                                                </div>
                                            ) : (
                                                <Avatar name={msg.author} size="md" />
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-small font-semibold text-white">
                                                    {msg.author}
                                                </span>
                                                {msg.type === "ai" && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-premium/20 text-premium px-1.5 py-0.5 rounded-pill">
                                                        AI
                                                    </span>
                                                )}
                                                {msg.authorXP && (
                                                    <ImpactXPBadge score={msg.authorXP} size="sm" showIcon={false} />
                                                )}
                                            </div>
                                            <span className="text-label text-white/30 ml-auto">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                        <div className="text-small text-white/80 leading-relaxed whitespace-pre-line">
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message or ask the AI..."
                                    className="w-full px-5 py-4 pr-12 bg-white/5 border border-white/10 rounded-card text-small text-white placeholder-white/30 focus:outline-none focus:border-premium/50 transition-colors"
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-premium hover:text-white transition-colors">
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Right — Controls */}
                        <aside className="hidden lg:block space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-card p-5">
                                <h3 className="text-label text-white/60 mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <Settings size={14} />
                                    Session Settings
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-label text-white/40 block mb-1">Topic</label>
                                        <p className="text-small text-white/80">B2B SaaS Validation</p>
                                    </div>
                                    <div>
                                        <label className="text-label text-white/40 block mb-1">AI Model</label>
                                        <p className="text-small text-white/80">GPT-4 Enhanced</p>
                                    </div>
                                    <div>
                                        <label className="text-label text-white/40 block mb-1">Participants</label>
                                        <p className="text-small text-white/80">3 humans + 1 AI</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-card p-5">
                                <h3 className="text-label text-white/60 mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <Users size={14} />
                                    Participants
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={session?.user?.name || "You"} size="sm" />
                                        <span className="text-small text-white/80 flex-1 truncate">
                                            {session?.user?.name || "You"}
                                        </span>
                                        <ImpactXPBadge score={session?.user?.impactXP || 50} size="sm" showIcon={false} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-premium flex items-center justify-center">
                                            <Bot size={12} className="text-white" />
                                        </div>
                                        <span className="text-small text-premium">Super AI Agent</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 text-small text-white/40 hover:text-white/60 py-3 border border-white/10 rounded-card transition-colors">
                                <Download size={14} />
                                Export Session
                            </button>
                        </aside>
                    </div>
                </div>

                {/* ─── Paywall Overlay ─── */}
                {showPaywall && !checkingSubscription && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#1A1025]/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-surface rounded-card p-8 max-w-md w-full mx-6 shadow-modal text-center relative"
                        >
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                            >
                                <X size={20} />
                            </button>
                            <div className="w-16 h-16 mx-auto mb-6 bg-premium-soft rounded-full flex items-center justify-center">
                                <Crown size={28} className="text-premium" />
                            </div>
                            <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
                                Unlock Super Environment
                            </h2>
                            <p className="text-body text-text-secondary mb-6">
                                Get access to AI-enhanced collaborative sessions, premium insights,
                                and advanced workspace features.
                            </p>
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-text-primary">₹299</span>
                                <span className="text-text-muted">/month</span>
                            </div>
                            <div className="space-y-3 text-left mb-8">
                                {[
                                    "AI-powered discussion assistant",
                                    "Unlimited collaborative sessions",
                                    "Premium analytics & insights",
                                    "Priority support",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-premium-soft flex items-center justify-center flex-shrink-0">
                                            <Sparkles size={10} className="text-premium" />
                                        </div>
                                        <span className="text-small text-text-secondary">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="premium"
                                size="lg"
                                className="w-full mb-3"
                                onClick={handleSubscribe}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : "Subscribe Now"}
                            </Button>
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="text-small text-text-muted hover:text-text-secondary transition-colors"
                            >
                                Maybe later
                            </button>
                        </motion.div>
                    </div>
                )}
            </main>
        </>
    );
}
