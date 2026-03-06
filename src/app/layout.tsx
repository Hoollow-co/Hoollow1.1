import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hoollow — Ideas into Impact",
  description:
    "The proof-of-work social ecosystem for student builders, early-stage founders, and young innovators. Build, prove your work, and get seen.",
  keywords: [
    "student builders",
    "proof of work",
    "ImpactXP",
    "startups",
    "innovation",
    "young founders",
  ],
  openGraph: {
    title: "Hoollow — Ideas into Impact",
    description:
      "The proof-of-work social ecosystem for student builders and young founders.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-ui">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
