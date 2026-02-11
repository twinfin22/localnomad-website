import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

export const metadata: Metadata = {
  title: "LocalNomad — Your Asia Toolkit",
  description:
    "Everything you need to live, work, and thrive in Asia. Curated guides, area insights, and visa support.",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
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
