import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FAF9F7",
        surface: "#FFFFFF",
        "surface-alt": "#F3F1EE",
        border: "#E8E5E1",
        "text-primary": "#0F0F0F",
        "text-secondary": "#6B6B6B",
        "text-muted": "#A0A0A0",
        accent: "#0F0F0F",
        "accent-hover": "#1A1A1A",
        "accent-soft": "#F3F1EE",
        "accent-inverse": "#FFFFFF",
        success: "#2D9B6F",
        premium: "#7C3AED",
        "premium-soft": "#F3EEFF",
        "premium-hover": "#6D28D9",
        link: "#0F6FFF",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        ui: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        section: ["2.25rem", { lineHeight: "1.2", fontWeight: "600" }],
        "card-title": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.6875rem", { lineHeight: "1.4", fontWeight: "600" }],
        button: ["0.875rem", { lineHeight: "1", fontWeight: "600" }],
      },
      spacing: {
        "space-1": "8px",
        "space-2": "16px",
        "space-3": "24px",
        "space-4": "32px",
        "space-6": "48px",
        "space-8": "64px",
        "space-12": "96px",
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
        pill: "999px",
        input: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.10)",
        modal: "0 20px 60px rgba(0,0,0,0.14)",
        "btn-hover": "0 4px 12px rgba(0,0,0,0.20)",
      },
      maxWidth: {
        content: "1120px",
        narrow: "720px",
      },
    },
  },
  plugins: [],
};
export default config;
