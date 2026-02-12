import type React from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
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
  display: "swap",
});

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <ThemePreviewProvider>
              <AuthProvider>
                <Suspense fallback={null}>
                  <div id="main-content">
                    {children}
                  </div>
                </Suspense>
              </AuthProvider>
            </ThemePreviewProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
