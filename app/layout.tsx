import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { DM_Sans, DM_Serif_Display, Noto_Sans_JP, Noto_Sans_SC, Noto_Sans_TC } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400'],
  variable: '--font-lora',
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

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto-sans-tc',
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

  return (
    <html lang={locale} suppressHydrationWarning className={`${dmSans.variable} ${dmSerifDisplay.variable} ${notoSansJP.variable} ${notoSansSC.variable} ${notoSansTC.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
