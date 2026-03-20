import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import { getChecklistData } from '@/lib/checklist-data';
import { ArrivalChecklist } from '@/components/checklist';

export const revalidate = 3600;

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;

const COUNTRY_DISPLAY: Record<string, string> = {
  korea: 'South Korea',
  taiwan: 'Taiwan',
  japan: 'Japan',
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
  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) return {};

  const t = await getTranslations({ locale, namespace: 'Checklist' });
  const displayName = COUNTRY_DISPLAY[country] ?? country;
  const title = `${displayName} Arrival Checklist — 72-Hour Survival Kit | LocalNomad`;
  const description = t('metaDescription', { country: displayName });
  const alternates = getAlternates(locale, `/${country}/checklist`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: `https://localnomad.club/${locale}/${country}/checklist`,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ChecklistPage({ params }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return notFound();
  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) return notFound();
  setRequestLocale(locale);

  const data = await getChecklistData(country);
  if (!data) return notFound();

  const t = await getTranslations({ locale, namespace: 'Checklist' });
  const displayName = COUNTRY_DISPLAY[country] ?? country;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent px-4 pt-28 pb-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {t('badge')}
          </p>
          <h1 className="font-lora mt-2 text-3xl font-bold sm:text-4xl">
            {t('title', { country: displayName })}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {t('subtitle', { country: displayName })}
          </p>
        </div>
      </section>

      <ArrivalChecklist data={data} country={country} />
    </div>
  );
}
