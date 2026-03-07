"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowLeft,
    Code2,
    Rocket,
    TrendingUp,
    Zap,
    Plus,
    X,
    Check,
    Sparkles,
} from "lucide-react";
import Button from "@/components/Button";
import XPProgressBar from "@/components/XPProgressBar";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const skillOptions = [
    "React", "Next.js", "TypeScript", "Python", "Node.js", "Flutter",
    "Figma", "UI/UX", "Product Design", "Go-to-Market", "Machine Learning",
    "Data Science", "DevOps", "Blockchain", "IoT", "3D Printing",
    "Content Writing", "Marketing", "Fundraising", "Leadership",
];

const roles = [
    {
        id: "builder",
        icon: <Code2 size={32} />,
        title: "Student Builder",
        desc: "I build projects and want visibility",
        color: "border-[#0F6FFF]",
        bg: "bg-[#E8F4FF]",
        accent: "#0F6FFF",
    },
    {
        id: "founder",
        icon: <Rocket size={32} />,
        title: "Early Founder",
        desc: "I'm building a startup and need a team",
        color: "border-premium",
        bg: "bg-premium-soft",
        accent: "#8B5CF6",
    },
    {
        id: "investor",
        icon: <TrendingUp size={32} />,
        title: "Investor",
        desc: "I want to discover early talent and deal flow",
        color: "border-success",
        bg: "bg-[#F0FFF4]",
        accent: "#22C55E",
    },
];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 400 : -400,
        opacity: 0,
        scale: 0.95,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
        x: direction < 0 ? 400 : -400,
        opacity: 0,
        scale: 0.95,
    }),
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [selectedRole, setSelectedRole] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [projects, setProjects] = useState([
        { title: "", description: "", link: "" },
    ]);
    const [xpAnimated, setXpAnimated] = useState(0);
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ─── If already logged in with a completed profile, redirect to feed ───
    useEffect(() => {
        if (status === "loading") return;

        if (status === "authenticated" && session?.user) {
            // Check the DB to see if they've completed their profile
            fetch("/api/profile")
                .then((res) => res.json())
                .then((data) => {
                    if (data?.user?.bio || (data?.user?.skills && JSON.stringify(data.user.skills) !== "[]")) {
                        // User already has a profile, redirect to feed
                        router.replace("/feed");
                    } else {
                        // User is logged in but hasn't completed onboarding
                        setDisplayName(session.user?.name || "");
                        setStep(2);
                        setChecking(false);
                    }
                })
                .catch(() => {
                    // On error, let them proceed with onboarding
                    setDisplayName(session.user?.name || "");
                    setStep(2);
                    setChecking(false);
                });
        } else {
            setChecking(false);
        }
    }, [status, session, router]);

    const goNext = async () => {
        if (step === 3) {
            setSubmitting(true);
            try {
                await fetch("/api/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        role: selectedRole,
                        displayName,
                        bio,
                        skills: selectedSkills,
                        projects,
                    }),
                });
                await update({
                    role: selectedRole,
                    name: displayName,
                });
            } catch (err) {
                console.error("Failed to save profile:", err);
            } finally {
                setSubmitting(false);
            }
            setDirection(1);
            setStep((s) => s + 1);
        } else if (step < 4) {
            setDirection(1);
            setStep((s) => s + 1);
        }
    };

    const goBack = () => {
        if (step > 1) {
            setDirection(-1);
            setStep((s) => s - 1);
        }
    };

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const addProject = () => {
        if (projects.length < 3) {
            setProjects([...projects, { title: "", description: "", link: "" }]);
        }
    };

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    const updateProject = (
        index: number,
        field: "title" | "description" | "link",
        value: string
    ) => {
        const updated = [...projects];
        updated[index][field] = value;
        setProjects(updated);
    };

    useEffect(() => {
        if (step === 4) {
            let current = 0;
            const timer = setInterval(() => {
                current += 1;
                if (current > 50) {
                    clearInterval(timer);
                    return;
                }
                setXpAnimated(current);
            }, 30);
            return () => clearInterval(timer);
        }
    }, [step]);

    const canProceed = () => {
        switch (step) {
            case 1: return true;
            case 2: return selectedRole !== "";
            case 3: return displayName.length > 0;
            case 4: return true;
            default: return false;
        }
    };

    // ─── Loading State ───
    if (checking || status === "loading") {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* ─── Background Decoration ─── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-premium/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, 15, 0], y: [0, 25, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/3 w-48 h-48 bg-success/5 rounded-full blur-3xl"
                />
            </div>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 relative z-10"
            >
                <span className="font-display text-2xl font-semibold text-text-primary flex items-center gap-2">
                    <Sparkles size={20} className="text-accent" />
                    Hoollow
                </span>
            </motion.div>

            {/* Progress indicator */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2 mb-10 relative z-10"
            >
                {[1, 2, 3, 4].map((s) => (
                    <motion.div
                        key={s}
                        animate={{
                            width: s <= step ? 32 : 16,
                            backgroundColor: s <= step ? "var(--color-accent, #1a1a1a)" : "var(--color-border, #e5e5e5)",
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="h-1.5 rounded-pill"
                    />
                ))}
            </motion.div>

            {/* Step Content */}
            <div className="w-full max-w-xl relative z-10">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Step 1: Sign Up */}
                        {step === 1 && (
                            <motion.div
                                className="text-center"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.h1
                                    variants={fadeInUp}
                                    custom={0}
                                    className="font-display text-section text-text-primary mb-4"
                                >
                                    Join the builders.
                                </motion.h1>
                                <motion.p
                                    variants={fadeInUp}
                                    custom={1}
                                    className="text-body text-text-secondary mb-10"
                                >
                                    No resumes. No credentials. Just what you&apos;ve built.
                                </motion.p>
                                <motion.button
                                    variants={fadeInUp}
                                    custom={2}
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                                    className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 bg-accent text-accent-inverse font-semibold px-6 py-4 rounded-btn text-button hover:bg-accent-hover transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </motion.button>
                                <motion.p
                                    variants={fadeInUp}
                                    custom={3}
                                    className="text-label text-text-muted mt-4"
                                >
                                    By signing up you agree to our Terms of Service
                                </motion.p>
                            </motion.div>
                        )}

                        {/* Step 2: Choose Role */}
                        {step === 2 && (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.h1
                                    variants={fadeInUp}
                                    custom={0}
                                    className="font-display text-section text-text-primary text-center mb-4"
                                >
                                    What brings you here?
                                </motion.h1>
                                <motion.p
                                    variants={fadeInUp}
                                    custom={1}
                                    className="text-body text-text-secondary text-center mb-10"
                                >
                                    This helps us personalize your experience.
                                </motion.p>
                                <div className="space-y-4">
                                    {roles.map((role, i) => (
                                        <motion.button
                                            key={role.id}
                                            variants={fadeInUp}
                                            custom={i + 2}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedRole(role.id)}
                                            className={`w-full text-left p-6 rounded-card border-2 transition-all duration-200 ${selectedRole === role.id
                                                ? `${role.color} ${role.bg} shadow-md`
                                                : "border-border bg-surface hover:border-text-muted hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    animate={selectedRole === role.id ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { scale: 1 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="text-text-primary"
                                                >
                                                    {role.icon}
                                                </motion.div>
                                                <div>
                                                    <p className="font-semibold text-text-primary text-lg">{role.title}</p>
                                                    <p className="text-small text-text-secondary">{role.desc}</p>
                                                </div>
                                                <AnimatePresence>
                                                    {selectedRole === role.id && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0, opacity: 0 }}
                                                            className="ml-auto"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                                <Check size={18} className="text-text-primary" />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Profile */}
                        {step === 3 && (
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.h1 variants={fadeInUp} custom={0} className="font-display text-section text-text-primary text-center mb-2">
                                    Forget your resume.
                                </motion.h1>
                                <motion.p variants={fadeInUp} custom={1} className="text-body text-text-secondary text-center mb-10">
                                    Tell us what you&apos;ve built.
                                </motion.p>

                                <div className="space-y-6">
                                    <motion.div variants={fadeInUp} custom={2}>
                                        <label className="text-small font-medium text-text-primary block mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all"
                                        />
                                    </motion.div>

                                    <motion.div variants={fadeInUp} custom={3}>
                                        <label className="text-small font-medium text-text-primary block mb-2">
                                            Short Bio <span className="text-text-muted ml-2">{bio.length}/140</span>
                                        </label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value.slice(0, 140))}
                                            placeholder="What drives you? What are you building?"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-input text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] transition-all resize-none"
                                        />
                                    </motion.div>

                                    <motion.div variants={fadeInUp} custom={4}>
                                        <label className="text-small font-medium text-text-primary block mb-2">Skills</label>
                                        <div className="flex flex-wrap gap-2">
                                            {skillOptions.map((skill) => (
                                                <motion.button
                                                    key={skill}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => toggleSkill(skill)}
                                                    className={`text-small px-3 py-1.5 rounded-pill font-medium transition-all duration-200 ${selectedSkills.includes(skill)
                                                        ? "bg-accent text-accent-inverse shadow-sm"
                                                        : "bg-surface-alt text-text-secondary hover:bg-border"
                                                        }`}
                                                >
                                                    {selectedSkills.includes(skill) && <Check size={12} className="inline mr-1" />}
                                                    {skill}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    <motion.div variants={fadeInUp} custom={5}>
                                        <label className="text-small font-medium text-text-primary block mb-2">What have you built?</label>
                                        <AnimatePresence>
                                            {projects.map((project, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-surface-alt rounded-card p-4 mb-3 relative overflow-hidden"
                                                >
                                                    {projects.length > 1 && (
                                                        <button onClick={() => removeProject(i)} className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    <input type="text" value={project.title} onChange={(e) => updateProject(i, "title", e.target.value)} placeholder="Project name"
                                                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent mb-2 transition-colors" />
                                                    <input type="text" value={project.description} onChange={(e) => updateProject(i, "description", e.target.value)} placeholder="One-line description"
                                                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent mb-2 transition-colors" />
                                                    <input type="url" value={project.link} onChange={(e) => updateProject(i, "link", e.target.value)} placeholder="Link (optional)"
                                                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-small text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors" />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {projects.length < 3 && (
                                            <motion.button
                                                whileHover={{ x: 4 }}
                                                onClick={addProject}
                                                className="flex items-center gap-2 text-small font-medium text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                <Plus size={14} /> Add another project
                                            </motion.button>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Welcome */}
                        {step === 4 && (
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.8 }}
                                >
                                    <div className="w-24 h-24 mx-auto mb-8 bg-accent rounded-full flex items-center justify-center relative">
                                        <Zap size={40} className="text-accent-inverse" />
                                        {/* Sparkle particles */}
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0, opacity: 1 }}
                                                animate={{
                                                    scale: [0, 1, 0],
                                                    opacity: [1, 1, 0],
                                                    x: [0, (Math.random() - 0.5) * 100],
                                                    y: [0, (Math.random() - 0.5) * 100],
                                                }}
                                                transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                                                className="absolute w-2 h-2 bg-accent rounded-full"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="font-display text-section text-text-primary mb-4"
                                >
                                    Welcome to Hoollow!
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-body text-text-secondary mb-8"
                                >
                                    You&apos;re starting with{" "}
                                    <span className="font-bold text-text-primary">
                                        {xpAnimated} ImpactXP
                                    </span>
                                    . Keep building to grow it.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="max-w-sm mx-auto mb-10"
                                >
                                    <XPProgressBar current={xpAnimated} max={100} animate={false} />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => router.push("/feed")}
                                    >
                                        Go to Your Feed <ArrowRight size={16} className="ml-1" />
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <AnimatePresence>
                {step !== 4 && step > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex items-center gap-4 mt-10 relative z-10"
                    >
                        <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" onClick={goBack}>
                                <ArrowLeft size={16} className="mr-1" /> Back
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="primary"
                                onClick={goNext}
                                disabled={!canProceed() || submitting}
                                className={(!canProceed() || submitting) ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {submitting ? "Saving..." : step === 3 ? "Complete Setup" : "Next"}
                                <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
