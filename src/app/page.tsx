"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Rocket,
  Users,
  Shield,
  Sparkles,
  Lock,
  Eye,
  ChevronUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import ImpactXPBadge from "@/components/ImpactXPBadge";
import RoleBadge from "@/components/RoleBadge";
import XPProgressBar from "@/components/XPProgressBar";
import ProjectCard from "@/components/ProjectCard";
import Avatar from "@/components/Avatar";
import { mockProjects, mockUsers, teamMembers } from "@/lib/mockData";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ─── Section 1: Hero ─── */}
        <motion.section
          className="section-padding"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-content mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
              {/* Left */}
              <motion.div className="lg:col-span-3" variants={fadeInUp}>
                <h1 className="font-display text-hero text-text-primary mb-6">
                  Build. Prove.
                  <br />
                  Get Seen.
                </h1>
                <p className="text-lg text-text-secondary max-w-lg mb-8 leading-relaxed">
                  Hoollow is the proof-of-work ecosystem for student builders and young
                  founders. Your ImpactXP speaks louder than your resume.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/onboarding">
                    <Button variant="primary" size="lg">
                      Start Building <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="ghost" size="lg">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Right — Floating XP Card */}
              <motion.div
                className="lg:col-span-2"
                variants={fadeInUp}
              >
                <div className="bg-surface border border-border rounded-card p-6 shadow-card relative">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name="Priya Sharma" size="lg" />
                      <div>
                        <p className="font-semibold text-text-primary">Priya Sharma</p>
                        <RoleBadge role="builder" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <ImpactXPBadge score={1840} size="md" />
                      <span className="text-small text-text-muted">Rank #2</span>
                    </div>
                    <XPProgressBar current={1840} max={2000} />
                    <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-text-primary">4</p>
                        <p className="text-label text-text-muted">Projects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-text-primary">3</p>
                        <p className="text-label text-text-muted">Clubs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-text-primary">12</p>
                        <p className="text-label text-text-muted">Collabs</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Logo strip */}
            <motion.div
              className="mt-20 pt-10 border-t border-border"
              variants={fadeInUp}
            >
              <p className="text-small text-text-muted mb-6 uppercase tracking-wider font-semibold">
                Used by builders from →
              </p>
              <div className="flex items-center gap-10 overflow-x-auto pb-4">
                {["IIT Delhi", "BITS Pilani", "NIT Trichy", "IIIT Hyderabad", "VIT Vellore", "DTU"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-lg font-semibold text-text-muted/50 whitespace-nowrap font-display"
                    >
                      {name}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Section 2: Problem Statement ─── */}
        <motion.section
          className="section-padding"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-narrow mx-auto px-6 text-center mb-12">
            <motion.p variants={fadeInUp} className="text-label text-text-primary mb-4 uppercase tracking-wider font-semibold">
              THE PROBLEM
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-display text-section text-text-primary">
              The ecosystem wasn&apos;t built for you.
            </motion.h2>
          </div>
          <div className="max-w-content mx-auto px-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={stagger}
            >
              {[
                {
                  icon: <Lock size={24} />,
                  title: "Age-gated platforms",
                  desc: "LinkedIn, AngelList, and others lock you out before you even start. Age shouldn't be a barrier to opportunity.",
                },
                {
                  icon: <Eye size={24} />,
                  title: "Invisible talent",
                  desc: "Without proof-of-work, your skills stay invisible. No portfolio system means no visibility to those who matter.",
                },
                {
                  icon: <Users size={24} />,
                  title: "Broken team formation",
                  desc: "Finding co-founders relies on personal networks and elite college connections. Merit is secondary.",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-surface border border-border rounded-card p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-surface-alt rounded-card flex items-center justify-center text-text-primary">
                    {card.icon}
                  </div>
                  <h3 className="text-card-title font-semibold text-text-primary mb-2">
                    {card.title}
                  </h3>
                  <p className="text-small text-text-secondary">{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Section 3: Features ─── */}
        <motion.section
          id="features"
          className="section-padding bg-surface-alt"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-content mx-auto px-6">
            <motion.h2
              variants={fadeInUp}
              className="font-display text-section text-text-primary text-center mb-12"
            >
              Everything you need to prove your work.
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger}
            >
              {[
                {
                  icon: <Zap size={24} />,
                  title: "ImpactXP Engine",
                  desc: "Your merit score, earned through building. It determines your visibility in the feed, access to opportunities, and investor discoverability.",
                  premium: false,
                },
                {
                  icon: <TrendingUp size={24} />,
                  title: "Merit Feed",
                  desc: "An algorithm that ranks by proof-of-work, not popularity. Recency, ImpactXP, votes, and collaboration all factor into what you see.",
                  premium: false,
                },
                {
                  icon: <Rocket size={24} />,
                  title: "Launchpad",
                  desc: "Submit your project for 48-hour community voting. Top-voted projects get featured, investor visibility, and ImpactXP rewards.",
                  premium: false,
                },
                {
                  icon: <Users size={24} />,
                  title: "Clubs",
                  desc: "Form teams, collaborate on projects, and earn collective ImpactXP. Find your crew based on skills and interests, not connections.",
                  premium: false,
                },
                {
                  icon: <Shield size={24} />,
                  title: "Human Environment",
                  desc: "Verified, human-only discussion threads. No bots, no spam — just authentic conversation between builders who ship.",
                  premium: false,
                },
                {
                  icon: <Sparkles size={24} />,
                  title: "Super Environment",
                  desc: "Premium AI + human hybrid workspace. AI agents assist your discussions with context-aware insights and suggestions.",
                  premium: true,
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="bg-surface border border-border rounded-card p-6 hover:shadow-card-hover transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-btn flex items-center justify-center ${feature.premium ? "bg-premium-soft text-premium" : "bg-surface-alt text-text-primary"}`}>
                      {feature.icon}
                    </div>
                    {feature.premium && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-premium-soft text-premium px-2 py-0.5 rounded-pill">
                        Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-card-title font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-small text-text-secondary">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Section 4: ImpactXP Spotlight ─── */}
        <motion.section
          className="section-padding"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-content mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left — XP Card */}
              <motion.div variants={fadeInUp}>
                <div className="bg-surface border border-border rounded-card p-8 shadow-card">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar name="Ayush Kumar" size="xl" />
                    <div>
                      <p className="text-xl font-semibold text-text-primary">Ayush Kumar</p>
                      <RoleBadge role="founder" />
                    </div>
                  </div>
                  <ImpactXPBadge score={2140} size="lg" className="mb-4" />
                  <XPProgressBar current={2140} max={2500} />
                  <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">6</p>
                      <p className="text-label text-text-muted">Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">4</p>
                      <p className="text-label text-text-muted">Clubs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">18</p>
                      <p className="text-label text-text-muted">Collabs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-text-primary">5</p>
                      <p className="text-label text-text-muted">Milestones</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right — Copy */}
              <motion.div variants={fadeInUp}>
                <h2 className="font-display text-section text-text-primary mb-6">
                  Your work earns you visibility.
                </h2>
                <div className="space-y-4">
                  {[
                    "Earn XP by shipping projects, getting upvotes, and contributing to clubs",
                    "XP decays with inactivity — stay building to stay visible",
                    "Higher XP = higher ranking in the merit-based feed algorithm",
                    "Cross the investor visibility threshold to appear in deal flow searches",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle
                        size={20}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <p className="text-body text-text-secondary">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ─── Section 5: Launchpad Preview ─── */}
        <motion.section
          className="section-padding bg-surface-alt"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-content mx-auto px-6">
            <motion.h2
              variants={fadeInUp}
              className="font-display text-section text-text-primary text-center mb-4"
            >
              Launch your project. Get community votes.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-body text-text-secondary text-center mb-12 max-w-lg mx-auto"
            >
              Submit to the 48-hour Launchpad. Top-voted projects get investor visibility and ImpactXP rewards.
            </motion.p>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={stagger}
            >
              {mockProjects.slice(0, 3).map((project) => (
                <motion.div key={project.id} variants={fadeInUp}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center mt-10">
              <Link href="/launchpad">
                <Button variant="ghost" size="lg">
                  Explore Launchpad <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Section 6: For Investors ─── */}
        <motion.section
          className="py-24 bg-accent"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-content mx-auto px-6">
            <motion.h2
              variants={fadeInUp}
              className="font-display text-section text-bg text-center mb-12"
            >
              Find talent before anyone else.
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
              variants={stagger}
            >
              {[
                {
                  title: "Early Deal Flow",
                  desc: "Access projects and founders before they appear anywhere else. ImpactXP-verified and community-validated.",
                },
                {
                  title: "ImpactXP-Filtered Search",
                  desc: "Search builders by verified proof-of-work score, domain, skills, and collaboration history.",
                },
                {
                  title: "Direct Founder Contact",
                  desc: "Connect directly with high-XP builders and founders. No gatekeepers, no middlemen.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="border border-white/10 rounded-card p-6"
                >
                  <h3 className="text-card-title font-semibold text-bg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-small text-bg/60">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <Button variant="white" size="lg">
                Request Investor Access
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Section 7: Team ─── */}
        <motion.section
          className="section-padding"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <div className="max-w-content mx-auto px-6">
            <motion.h2
              variants={fadeInUp}
              className="font-display text-section text-text-primary text-center mb-12"
            >
              Built by 11 teenage innovators.
            </motion.h2>

            {/* Founder Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-surface border border-border rounded-card p-8 max-w-lg mx-auto mb-12"
            >
              <div className="flex items-center gap-4 mb-4">
                <Avatar name="Ayush Kumar" size="xl" />
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">Ayush Kumar</h3>
                  <p className="text-small text-text-secondary">Age 15 · Founder & CEO</p>
                  <RoleBadge role="founder" className="mt-2" />
                </div>
              </div>
              <p className="text-body text-text-secondary">
                Obsessed with making opportunities merit-based for every young builder.
                Building Hoollow to prove that age is just a number when it comes to impact.
              </p>
            </motion.div>

            {/* Team Grid */}
            <motion.div
              className="flex flex-wrap justify-center gap-6"
              variants={stagger}
            >
              {teamMembers.slice(1).map((member, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex flex-col items-center gap-2"
                >
                  <Avatar name={member.name} size="lg" />
                  <p className="text-small font-medium text-text-primary">{member.name}</p>
                  <p className="text-label text-text-muted">{member.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ─── Section 8: CTA Banner ─── */}
        <section className="py-20 bg-accent">
          <div className="max-w-content mx-auto px-6 text-center">
            <h2 className="font-display text-section text-bg mb-8">
              Ready to prove your work?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/onboarding">
                <Button variant="white" size="lg">
                  Create Your Profile
                </Button>
              </Link>
              <Link href="/launchpad">
                <Button variant="white-outline" size="lg">
                  Explore Launchpad
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
