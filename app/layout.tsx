import type { Metadata, Viewport } from 'next';
import { getLocale } from 'next-intl/server';
import { Inter, DM_Serif_Display, Noto_Sans_JP, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  variable: '--font-dm-serif',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://localnomad.club'),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const fontClasses = [
    inter.variable,
    dmSerifDisplay.variable,
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
