import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country } = await params;
  const alternates = getAlternates(locale, `/${country}/visa/change`);
  const year = new Date().getFullYear();

  return {
    title: `Change Visa Status in Korea ${year} | LocalNomad`,
    description:
      'Find out which visa you can change to from your current status in Korea. Covers E-7, F-2, F-5, D-10, H-1, B-2, F-1-D and more. Not legal advice.',
    alternates,
    openGraph: {
      title: `Change Visa Status in Korea ${year} | LocalNomad`,
      description:
        'Card-based guide to all confirmed in-country visa change paths in Korea. See requirements, timelines, and source links.',
      type: 'website',
      siteName: 'LocalNomad',
      url: `https://localnomad.club/${locale}/${country}/visa/change`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Change Visa Status in Korea ${year} | LocalNomad`,
      description:
        'Card-based guide to all confirmed in-country visa change paths in Korea.',
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

  const displayCountry = country === 'korea' ? 'South Korea' : country;

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
      { '@type': 'ListItem', position: 3, name: 'Change Visa Status', item: `https://localnomad.club/${locale}/${country}/visa/change` },
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
            { label: 'Home', href: '/' },
            { label: displayCountry, href: `/${country}` },
            { label: 'Change Visa Status' },
          ]}
        />

        {/* Hero header */}
        <header className="bg-[#1B4965] px-5 pb-6 pt-7 text-white">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-widest text-white/60">
            LocalNomad · Korea Visa Guide
          </p>
          <h1 className="font-lora mb-2 text-3xl sm:text-4xl font-bold leading-snug">
            Change Your Visa Status in Korea
          </h1>
          <p className="text-sm leading-relaxed text-white/75">
            See which visa you can change to from your current status, what&apos;s required, and
            how long it takes.
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
              Select your current visa above to see change options
            </div>
          )}
        </div>
      </main>
    </>
  );
}
