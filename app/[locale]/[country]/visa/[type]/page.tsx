import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getVisaData } from '@/lib/visa-data';
import type { Country } from '@/lib/types/visa';

const VALID_COUNTRIES = ['korea', 'taiwan'] as const;

interface Props {
  params: Promise<{ locale: string; country: string; type: string }>;
}

export default async function VisaDetailPage({ params }: Props) {
  const { locale, country, type } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const visa = await getVisaData(country as Country, locale, type);
  const t = await getTranslations('VisaDetail');
  const tc = await getTranslations('Common');
  const displayCountry = country === 'korea' ? 'South Korea' : 'Taiwan';

  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href={`/${country}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; {tc('backToCountry', { country: displayCountry })}
        </Link>

        {visa ? (
          <>
            <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
              {visa.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {visa.tagline}
            </p>
            <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
              {t('comingSoon')}
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
              {t('title', { type: type.toUpperCase() })}
            </h1>
            <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
              {t('comingSoon')}
            </div>
          </>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {tc('disclaimer')}
        </p>
      </div>
    </main>
  );
}
