import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { Hero, HowItWorks, Features, StatsStrip } from '@/components/landing';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'Meta' });
  const alternates = getAlternates(locale);

  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    alternates,
    openGraph: {
      title: t('landingTitle'),
      description: t('landingDescription'),
      url: `https://localnomad.club/${locale}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('landingTitle'),
      description: t('landingDescription'),
      images: ['/og-default.png'],
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  return (
    <main id="main-content">
      <Hero />
      <HowItWorks />
      <Features />
      <StatsStrip />
    </main>
  );
}
