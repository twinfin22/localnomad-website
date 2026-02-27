import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Hero, HowItWorks, Features, StatsStrip } from '@/components/landing';

interface Props {
  params: Promise<{ locale: string }>;
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
