import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getAlternates } from '@/lib/seo';
import { getChecklistData } from '@/lib/checklist-data';
import { localizeChecklistLinks } from '@/lib/checklist-links';
import { ArrivalChecklist } from '@/components/checklist';

export const revalidate = 3600;

const VALID_COUNTRIES = ['japan', 'korea', 'taiwan'] as const;

const COUNTRY_NAME_KEY: Record<string, 'countryKorea' | 'countryTaiwan' | 'countryJapan'> = {
  korea: 'countryKorea',
  taiwan: 'countryTaiwan',
  japan: 'countryJapan',
};

export function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

type VisaTier = 'tourist' | 'long-term' | 'resident';
const VALID_TIERS: VisaTier[] = ['tourist', 'long-term', 'resident'];

interface Props {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ tier?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) return {};

  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: 'Checklist' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);
  const displayName = tc(COUNTRY_NAME_KEY[country] ?? 'countryKorea');
  const title = `${t('title', { country: displayName })} | LocalNomad`;
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
    },
  };
}

export default async function ChecklistPage({ params, searchParams }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return notFound();
  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) return notFound();
  setRequestLocale(locale);

  const sourceData = await getChecklistData(country, locale);
  if (!sourceData) return notFound();
  const data = localizeChecklistLinks(sourceData, locale);

  const { tier: tierParam } = await searchParams;
  const defaultTier = VALID_TIERS.includes(tierParam as VisaTier)
    ? (tierParam as VisaTier)
    : 'tourist';

  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: 'Checklist' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);
  const displayName = tc(COUNTRY_NAME_KEY[country] ?? 'countryKorea');

  const COUNTRY_BG: Record<string, { src: string; position: string }> = {
    korea: { src: '/images/checklist/korea-checklist-bg.jpg', position: 'center 20%' },
    japan: { src: '/images/visa/japan-visa-bg.jpg', position: 'center 15%' },
    taiwan: { src: '/images/visa/taiwan-visa-bg.jpg', position: 'center 30%' },
  };

  return (
    <div className="min-h-screen">
      {/* Header with country background */}
      <section
        className="relative -mt-[70px] overflow-hidden border-b px-4 pt-28 pb-10"
        style={{
          backgroundImage: [
            'linear-gradient(to bottom, rgba(27,73,101,0.55) 0%, rgba(27,73,101,0.50) 100%)',
            `url('${COUNTRY_BG[country]?.src ?? ''}')`,
          ].join(', '),
          backgroundSize: 'cover',
          backgroundPosition: COUNTRY_BG[country]?.position ?? 'center 30%',
        }}
      >
        <div className="mx-auto max-w-3xl pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
            {t('badge')}
          </p>
          <h1 className="font-lora mt-2 text-3xl font-bold text-white sm:text-4xl [text-shadow:0_2px_6px_rgba(0,0,0,0.4)]">
            {t('title', { country: displayName })}
          </h1>
          <p className="mt-3 text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]">
            {t('subtitle', { country: displayName })}
          </p>
        </div>
      </section>

      <ArrivalChecklist data={data} country={country} defaultTier={defaultTier} />
    </div>
  );
}
