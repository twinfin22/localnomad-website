import type React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { Geist } from "next/font/google";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

/**
 * Layout for global pages (terms, privacy, refund, business)
 * These pages are outside the [lang] route but still need i18n context
 */
export default async function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${geist.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
