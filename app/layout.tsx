import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { DM_Sans, DM_Serif_Display, Lora, Noto_Sans_JP, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin', 'latin-ext'],
  weight: ['700'],
  style: ['italic'],
  variable: '--font-lora-brand',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://localnomad.club'),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const fontClasses = [
    dmSans.variable,
    dmSerifDisplay.variable,
    lora.variable,
    locale === 'ja' && notoSansJP.variable,
    locale === 'zh-cn' && notoSansSC.variable,
  ].filter(Boolean).join(' ');

  return (
    <html lang={locale} suppressHydrationWarning className={fontClasses}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
