import { Suspense } from 'react';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getAvailableVisas, getVisaData } from '@/lib/visa-data';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import type { Country, Visa } from '@/lib/types/visa';
import { ComparisonTool } from '@/components/visa';

const VALID_COUNTRIES = ['korea', 'taiwan', 'japan', 'china'] as const;

const COUNTRY_DISPLAY: Record<string, string> = {
  korea: 'South Korea',
  taiwan: 'Taiwan',
  japan: 'Japan',
  china: 'China',
};

export function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

interface Props {
  params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Comparison' });
  const displayName = COUNTRY_DISPLAY[country] ?? country;

  const title = `${t('title')} — ${displayName} | LocalNomad`;
  const description = t('metaDescription', { country: displayName });
  const alternates = getAlternates(locale, `/${country}/compare`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: `https://localnomad.club/${locale}/${country}/compare`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.png'],
    },
  };
}

export default async function ComparePage({ params }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const [t, tc, summaries] = await Promise.all([
    getTranslations('Comparison'),
    getTranslations('Common'),
    getAvailableVisas(country as Country, locale),
  ]);

  const visaResults = await Promise.all(
    summaries.map((s) => getVisaData(country as Country, locale, s.type))
  );
  const visas = visaResults.filter((v): v is Visa => v !== null);

  const displayName = COUNTRY_DISPLAY[country] ?? country;

  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Link
          href={`/${country}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; {tc('backToHome')} {displayName}
        </Link>
        <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
          {t('title')}
        </h1>

        <Suspense fallback={<div className="mt-8 text-muted-foreground">Loading...</div>}>
          <ComparisonTool
            visas={visas}
            summaries={summaries}
            country={country}
          />
        </Suspense>

        <p className="mt-10 text-xs text-muted-foreground">
          {tc('disclaimer')}
        </p>
      </div>
    </main>
  );
}
