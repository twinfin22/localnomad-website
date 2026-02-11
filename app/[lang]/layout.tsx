import type React from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemePreviewProvider } from "@/components/theme-preview";
import { AuthProvider } from "@/components/providers/auth-provider";
import { locales, type Locale } from "@/lib/i18n/config";

// =============================================================================
// Fonts - Geist only (LocalNomad Design System)
// =============================================================================

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const _geistMono = Geist_Mono({ subsets: ["latin"] });

const fontVariables = geist.variable;

// =============================================================================
// Static Params
// =============================================================================

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// =============================================================================
// Layout
// =============================================================================

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang } = await params;

  // Validate locale
  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  // Get messages for next-intl
  const messages = await getMessages();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${fontVariables} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <ThemePreviewProvider>
              <AuthProvider>{children}</AuthProvider>
            </ThemePreviewProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
