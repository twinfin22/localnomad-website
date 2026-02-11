import type React from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
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

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
