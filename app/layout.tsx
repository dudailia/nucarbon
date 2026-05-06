import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nucarbon.vercel.app"),
  title: {
    template: "%s | NUCarbon",
    default: "NUCarbon — Northeastern AI Carbon Intelligence",
  },
  description:
    "The first real-time AI carbon intelligence platform built for a research university. Tracking the energy and climate cost of AI tool usage across Northeastern University's 24,000-person campus.",
  keywords: ["AI carbon footprint", "university sustainability", "Northeastern", "AI energy", "carbon accounting"],
  authors: [{ name: "Ilia Duda" }],
  openGraph: {
    title: "NUCarbon — Northeastern AI Carbon Intelligence",
    description:
      "Real-time AI carbon tracking, peer benchmarking, and sustainability research intelligence for Northeastern University.",
    type: "website",
    url: "https://nucarbon.vercel.app",
    siteName: "NUCarbon",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NUCarbon — Northeastern AI Carbon Intelligence",
    description: "The first real-time AI carbon platform built for a research university.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#0a1a0f] text-white antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
