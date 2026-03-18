import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/nav';
import { Footer } from '@/components/footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    openGraph: {
      siteName: 'LocalNomad',
      type: 'website',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-default.png'],
    },
    other: { 'theme-color': '#1B4965' },
  };
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'LocalNomad',
              url: 'https://localnomad.club',
              inLanguage: ['en', 'ja', 'zh-Hans', 'zh-Hant', 'vi'],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LocalNomad',
              url: 'https://localnomad.club',
              logo: 'https://localnomad.club/logo_new_all-blue.png',
            },
          ]),
        }}
      />
      <Header />
      {children}
      <Footer />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </NextIntlClientProvider>
  );
}
