import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-surface border-t border-border mt-auto">
            <div className="max-w-content mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Logo & Tagline */}
                    <div className="md:col-span-1">
                        <Link href="/" className="font-display text-xl font-semibold text-text-primary">
                            Hoollow
                        </Link>
                        <p className="text-small text-text-secondary mt-3 leading-relaxed">
                            Ideas into Impact. The proof-of-work ecosystem for student builders and young founders.
                        </p>
                        <div className="flex items-center gap-4 mt-5">
                            <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="GitHub">
                                <Github size={18} />
                            </a>
                            <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="Email">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-label text-text-primary mb-4 uppercase tracking-wider">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            {["Feed", "Launchpad", "Clubs", "ImpactXP", "Super Environment"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-small text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-label text-text-primary mb-4 uppercase tracking-wider">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            {["About", "Team", "Careers", "Blog", "Press Kit"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-small text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-label text-text-primary mb-4 uppercase tracking-wider">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: "hello@hoollow.com", href: "mailto:hello@hoollow.com" },
                                { label: "Support", href: "#" },
                                { label: "Privacy Policy", href: "#" },
                                { label: "Terms of Service", href: "#" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-small text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-border mt-12 pt-8 text-center">
                    <p className="text-small text-text-muted">
                        © {new Date().getFullYear()} Hoollow. Built by 11 teenage innovators. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
