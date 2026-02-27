import { Inter, Lora } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LocalNomad — Visa clarity, finally.',
  description:
    'Everything you need to know about visas in one place — requirements, timelines, and real-world tips.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
