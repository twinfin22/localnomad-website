import type React from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getLocale } from "next-intl/server";
import { Geist } from "next/font/google";

// =============================================================================
// Fonts - Geist only (LocalNomad Design System)
// =============================================================================

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontVariables = geist.variable;

// =============================================================================
// Auth Layout - Global routes that don't need locale
// =============================================================================

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark">
      <body className={`${fontVariables} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
