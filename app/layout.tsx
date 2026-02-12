import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalNomad — Your Asia Toolkit",
  description:
    "Everything you need to live, work, and thrive in Asia. Curated guides, area insights, and visa support.",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "LocalNomad",
    title: "LocalNomad — Your Korea Visa Guide",
    description:
      "Navigate Korean visa requirements with confidence. Guides, eligibility checks, and document checklists for work, study, and digital nomad visas.",
    url: "https://localnomad.club",
    locale: "en_US",
    alternateLocale: ["ja_JP", "zh_TW"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

/**
 * Minimal root layout that just passes through children.
 * The actual HTML structure is in [lang]/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
