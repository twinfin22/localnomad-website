import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

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

  return <VisaDetailContent country={country} type={type} />;
}

function VisaDetailContent({
  country,
  type,
}: {
  country: string;
  type: string;
}) {
  const t = useTranslations('VisaDetail');
  const tc = useTranslations('Common');
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
        <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
          {t('title', { type: type.toUpperCase() })}
        </h1>
        <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
          {t('comingSoon')}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {tc('disclaimer')}
        </p>
      </div>
    </main>
  );
}
