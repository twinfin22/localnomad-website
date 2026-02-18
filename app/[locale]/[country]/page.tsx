import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

const VALID_COUNTRIES = ['korea', 'taiwan'] as const;

export function generateStaticParams() {
  return VALID_COUNTRIES.map((country) => ({ country }));
}

interface Props {
  params: Promise<{ locale: string; country: string }>;
}

export default async function CountryPage({ params }: Props) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  return <CountryContent country={country} />;
}

function CountryContent({ country }: { country: string }) {
  const t = useTranslations('Country');
  const tc = useTranslations('Common');
  const displayName = country === 'korea' ? 'South Korea' : 'Taiwan';

  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-primary hover:underline"
        >
          &larr; {tc('backToHome')}
        </Link>
        <h1 className="mt-6 font-lora text-4xl font-bold text-primary">
          {t('title', { country: displayName })}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('subtitle', { country: displayName })}
        </p>
        <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
          {t('comingSoon')}
        </div>
      </div>
    </main>
  );
}
