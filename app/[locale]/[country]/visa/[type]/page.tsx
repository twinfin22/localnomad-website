import { Suspense } from 'react';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getVisaData, getAvailableVisas } from '@/lib/visa-data';
import type { Country } from '@/lib/types/visa';
import {
  GlanceableZone,
  AuthActionZone,
  ContextZone,
  VisaDisclaimer,
} from '@/components/visa';
import { Breadcrumb } from '@/components/navigation/breadcrumb';

const VALID_COUNTRIES = ['korea', 'taiwan'] as const;

interface Props {
  params: Promise<{ locale: string; country: string; type: string }>;
}

export async function generateStaticParams() {
  const params: { locale: string; country: string; type: string }[] = [];

  for (const locale of routing.locales) {
    for (const country of VALID_COUNTRIES) {
      const visas = await getAvailableVisas(country, locale);
      for (const visa of visas) {
        params.push({ locale, country, type: visa.type });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country, type } = await params;
  const visa = await getVisaData(country as Country, locale, type);

  if (!visa) {
    return { title: `${type.toUpperCase()} Visa | LocalNomad` };
  }

  const year = new Date().getFullYear();
  const title = `${visa.name} | LocalNomad`;
  const description = visa.description.length > 155
    ? visa.description.slice(0, 152) + '...'
    : visa.description;

  return {
    title,
    description,
    openGraph: {
      title: `${visa.shortName} Visa — Requirements & Guide ${year} | LocalNomad`,
      description,
      type: 'article',
      siteName: 'LocalNomad',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${visa.shortName} Visa — Requirements & Guide ${year} | LocalNomad`,
      description,
    },
  };
}

export default async function VisaDetailPage({ params }: Props) {
  const { locale, country, type } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (
    !VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])
  ) {
    notFound();
  }

  const [visa, tc, t] = await Promise.all([
    getVisaData(country as Country, locale, type),
    getTranslations('Common'),
    getTranslations('VisaDetail'),
  ]);
  const displayCountry = country === 'korea' ? 'South Korea' : 'Taiwan';

  if (!visa) {
    return (
      <main id="main-content" className="min-h-svh bg-neutral-50">
        <Breadcrumb
          variant="band"
          items={[
            { label: tc('home'), href: '/' },
            { label: displayCountry, href: `/${country}` },
            { label: type.toUpperCase() },
          ]}
        />
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">
          <h1 className="font-lora text-4xl font-bold text-primary">
            {t('title', { type: type.toUpperCase() })}
          </h1>
          <div className="mt-8 rounded-lg border bg-white p-8 text-center text-muted-foreground">
            {t('comingSoon')}
          </div>
        </div>
      </main>
    );
  }

  // Schema.org JSON-LD: FAQPage
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visa.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Schema.org JSON-LD: HowTo
  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Apply for ${visa.name}`,
    step: visa.applicationSteps.map((step) => ({
      '@type': 'HowToStep',
      name: step.title,
      text: step.description,
    })),
  };

  // Schema.org JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tc('home'),
        item: `https://localnomad.club/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: displayCountry,
        item: `https://localnomad.club/${locale}/${country}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: visa.shortName,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <main id="main-content" className="min-h-svh bg-neutral-50">
        <Breadcrumb
          variant="band"
          items={[
            { label: tc('home'), href: '/' },
            { label: displayCountry, href: `/${country}` },
            { label: visa.shortName },
          ]}
        />
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">
          {/* Layer 1: Glanceable — streams immediately */}
          <GlanceableZone visa={visa} />

          {/* Layer 2: Action — auth-gated, loads in Suspense */}
          <Suspense
            fallback={
              <div className="mt-12 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-14 animate-pulse items-center gap-3 rounded-lg border bg-white px-4"
                  >
                    <div className="h-5 w-5 rounded bg-neutral-200" />
                    <div className="h-4 flex-1 rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            }
          >
            <AuthActionZone visa={visa} country={country} />
          </Suspense>

          {/* Layer 3: Context — streams immediately */}
          <ContextZone visa={visa} country={country} />

          {/* Legal Disclaimer */}
          <VisaDisclaimer country={country} />
        </div>
      </main>
    </>
  );
}
