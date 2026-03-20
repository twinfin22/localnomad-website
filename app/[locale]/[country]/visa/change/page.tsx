import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { routing } from '@/i18n/routing';
import { getVisaData } from '@/lib/visa-data';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import type { Country } from '@/lib/types/visa';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { VisaCardSelector } from '@/components/visa-change/VisaCardSelector';
import { TransitionResults } from '@/components/visa-change/TransitionResults';

export const revalidate = 86400;

const VALID_COUNTRIES = ['korea'] as const;

interface Props {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateStaticParams() {
  const params: { locale: string; country: string }[] = [];
  for (const locale of routing.locales) {
    for (const country of VALID_COUNTRIES) {
      params.push({ locale, country });
    }
  }
  return params;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  const fromParam = (await searchParams).from;
  let fromName: string | undefined;
  if (fromParam) {
    const fromVisa = await getVisaData(country as Country, locale, fromParam);
    fromName = fromVisa?.shortName ?? fromParam.toUpperCase();
  }
  const [t, alternates] = await Promise.all([
    getTranslations({ locale: locale as (typeof routing.locales)[number], namespace: 'VisaChange' }),
    Promise.resolve(getAlternates(locale, `/${country}/visa/change`)),
  ]);
  const year = new Date().getFullYear();

  const title = fromName ? t('metaTitleFrom', { from: fromName, year }) : t('metaTitle', { year });
  const description = fromName ? t('metaDescriptionFrom', { from: fromName }) : t('metaDescription');
  const ogDescription = t('metaOgDescription');

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description: ogDescription,
      type: 'website',
      siteName: 'LocalNomad',
      url: `https://localnomad.club/${locale}/${country}/visa/change`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: ['/og-default.png'],
    },
  };
}

export default async function VisaChangeHubPage({ params, searchParams }: Props) {
  const { locale, country } = await params;
  const { from } = await searchParams;

  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const t = await getTranslations('VisaChange');
  const tCommon = await getTranslations('Common');

  const displayCountry = country === 'korea' ? tCommon('countryKorea') : country;

  // If a "from" visa is selected, load its name for display
  let fromName: string | undefined;
  if (from) {
    const fromVisa = await getVisaData(country as Country, locale, from);
    fromName = fromVisa?.shortName ?? from.toUpperCase();
  }

  // Schema.org BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://localnomad.club/${locale}` },
      { '@type': 'ListItem', position: 2, name: displayCountry, item: `https://localnomad.club/${locale}/${country}` },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbChangeVisa'), item: `https://localnomad.club/${locale}/${country}/visa/change` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main id="main-content" className="min-h-svh bg-neutral-50">
        <Breadcrumb
          variant="band"
          items={[
            { label: tCommon('home'), href: '/' },
            { label: displayCountry, href: `/${country}` },
            { label: t('breadcrumbChangeVisa') },
          ]}
        />

        {/* Hero header */}
        <header className="bg-[#1B4965] px-5 pb-6 pt-7 text-white">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-widest text-white/70">
            {t('pageBadge')}
          </p>
          <h1 className="font-lora mb-2 text-3xl sm:text-4xl font-bold leading-snug">
            {t('pageTitle')}
          </h1>
          <p className="text-sm leading-relaxed text-white/75">
            {t('pageSubtitle')}
          </p>
        </header>

        <div className="mx-auto max-w-2xl">
          {/* Step 1: Visa card selector (Client Component) */}
          <Suspense fallback={<div className="p-5 text-sm text-slate-400">Loading...</div>}>
            <VisaCardSelector selectedFrom={from} country={country} />
          </Suspense>

          {/* Step 2: Results (Server Component, rendered when ?from= param is set) */}
          {from && fromName && (
            <div className="border-t border-slate-200 px-5 pb-8 pt-6">
              <TransitionResults
                from={from}
                fromName={fromName}
                country={country as Country}
                locale={locale}
              />
            </div>
          )}

          {/* Prompt when nothing selected */}
          {!from && (
            <div className="px-5 py-4 text-center text-sm text-slate-400">
              {t('selectPrompt')}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
