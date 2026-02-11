import type React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Inter, Cormorant_Garamond, Crimson_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemePreviewProvider } from "@/components/theme-preview";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Midnight Seoul theme fonts
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

// Black Label theme fonts
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LocalNomad — Your Seoul Toolkit",
  description:
    "Everything you need to live, work, and thrive in Korea. Curated guides, area insights, and visa support.",
  generator: "v0.app",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${outfit.variable} ${inter.variable} ${cormorant.variable} ${crimsonPro.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemePreviewProvider>
            {children}
          </ThemePreviewProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
