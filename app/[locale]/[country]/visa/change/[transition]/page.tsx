import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getAllTransitionPairs, getTransitionDetail } from '@/lib/visa-transitions';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import type { Country } from '@/lib/types/visa';
import { Breadcrumb } from '@/components/nav/breadcrumb';
import { ChangeDisclaimer } from '@/components/visa-change/ChangeDisclaimer';
import { NationalityBanner } from '@/components/visa-change/NationalityBanner';
import { MultiHopGuide } from '@/components/visa-change/MultiHopGuide';
import { TransitionTimeline } from '@/components/visa-change/TransitionTimeline';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export const revalidate = 86400;

const VALID_COUNTRIES = ['korea'] as const;

interface Props {
  params: Promise<{ locale: string; country: string; transition: string }>;
}

/** Parse "e-7-to-f-2" into { from: "e-7", to: "f-2" } */
function parseTransitionSlug(slug: string): { from: string; to: string } | null {
  // The slug format is "{from}-to-{to}". We split on "-to-" but need to handle
  // visa codes that contain hyphens (e.g., "f-1-d", "d-10").
  // Strategy: find all "-to-" occurrences and try splitting at each.
  const marker = '-to-';
  let idx = slug.indexOf(marker);
  while (idx !== -1) {
    const from = slug.slice(0, idx);
    const to = slug.slice(idx + marker.length);
    if (from.length > 0 && to.length > 0) {
      return { from, to };
    }
    idx = slug.indexOf(marker, idx + 1);
  }
  return null;
}

export async function generateStaticParams() {
  const params: { locale: string; country: string; transition: string }[] = [];

  for (const locale of routing.locales) {
    for (const country of VALID_COUNTRIES) {
      const pairs = await getAllTransitionPairs(country as Country, locale);
      for (const { from, to } of pairs) {
        // Skip d-4 transitions
        if (to === 'd-4') continue;
        params.push({ locale, country, transition: `${from}-to-${to}` });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, country, transition } = await params;
  const tMeta = await getTranslations({ locale: locale as (typeof routing.locales)[number], namespace: 'VisaChange' });
  const parsed = parseTransitionSlug(transition);
  if (!parsed) return { title: tMeta('metaTitleFallback') };

  const detail = await getTransitionDetail(country as Country, parsed.from, parsed.to, locale);
  if (!detail) return { title: tMeta('metaTitleFallback') };

  const { fromVisa, toVisa } = detail;
  const year = new Date().getFullYear();
  const from = fromVisa?.shortName ?? parsed.from.toUpperCase();
  const to = toVisa?.shortName ?? parsed.to.toUpperCase();
  const title = tMeta('metaTitleTransition', { from, to, year });
  const description = tMeta('metaDescriptionTransition', { from, to });
  const alternates = getAlternates(locale, `/${country}/visa/change/${transition}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'LocalNomad',
      url: `https://localnomad.club/${locale}/${country}/visa/change/${transition}`,
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

export default async function TransitionDetailPage({ params }: Props) {
  const { locale, country, transition } = await params;

  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  if (!VALID_COUNTRIES.includes(country as (typeof VALID_COUNTRIES)[number])) {
    notFound();
  }

  const parsed = parseTransitionSlug(transition);
  if (!parsed) notFound();

  const detail = await getTransitionDetail(country as Country, parsed.from, parsed.to, locale);
  if (!detail) notFound();

  const t = await getTranslations('VisaChange');
  const tCommon = await getTranslations('Common');

  const { fromVisa, toVisa, transition: tr } = detail;

  const displayCountry = country === 'korea' ? tCommon('countryKorea') : country;
  const fromCode = parsed.from.toUpperCase();
  const toCode = parsed.to.toUpperCase();
  const fromName = fromVisa?.shortName ?? fromCode;
  const toName = toVisa?.shortName ?? toCode;

  // Other paths from the same source visa (for related section)
  const otherPaths = (fromVisa?.pathsTo ?? []).filter(
    (p) => p.type !== parsed.to && p.type !== 'd-4',
  );

  // Schema.org Article
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${fromCode} to ${toCode}: Change from ${fromName} to ${toName} in Korea`,
    description: `Requirements, timeline and documents for changing from ${fromName} to ${toName} in Korea.`,
    image: 'https://localnomad.club/og-default.png',
    author: { '@type': 'Organization', name: 'LocalNomad' },
    publisher: { '@type': 'Organization', name: 'LocalNomad', url: 'https://localnomad.club', logo: { '@type': 'ImageObject', url: 'https://localnomad.club/logo_new_all-blue.png' } },
    datePublished: tr.lastUpdated ?? '2026-01-01',
    dateModified: tr.lastUpdated ?? new Date().toISOString().slice(0, 10),
    url: `https://localnomad.club/${locale}/${country}/visa/change/${transition}`,
  };

  // Schema.org BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://localnomad.club/${locale}` },
      { '@type': 'ListItem', position: 2, name: displayCountry, item: `https://localnomad.club/${locale}/${country}` },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbChangeVisa'), item: `https://localnomad.club/${locale}/${country}/visa/change` },
      { '@type': 'ListItem', position: 4, name: `${fromCode} → ${toCode}`, item: `https://localnomad.club/${locale}/${country}/visa/change/${transition}` },
    ],
  };

  const exitValue = tr.nationalityDependent
    ? t('exitDependsOnPassport')
    : tr.mustExitCountry
    ? t('exitMustLeave')
    : t('exitInCountry');

  const exitValueClass = tr.nationalityDependent
    ? 'text-amber-700'
    : tr.mustExitCountry
    ? 'text-[#D64045]'
    : 'text-green-700';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
            { label: t('breadcrumbChangeStatus'), href: `/${country}/visa/change` },
            { label: `${fromCode} → ${toCode}` },
          ]}
        />

        <div className="mx-auto max-w-2xl px-5 pb-16 pt-6">
          {/* Disclaimer ABOVE */}
          <div className="mb-6">
            <ChangeDisclaimer position="above" />
          </div>

          {/* Title */}
          <h1 className="font-lora mb-1 text-3xl sm:text-4xl font-bold leading-snug text-primary">
            {fromCode} → {toCode}: Change from {fromName} to {toName}
          </h1>
          <p className="mb-5 text-sm text-slate-500">{t('pageSubheading')}</p>

          {/* Summary chips 2×2 grid */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            <SummaryChip label={t('chipTimeline')} value={tr.timeline} />
            <SummaryChip
              label={t('chipExitRequired')}
              value={exitValue}
              valueClass={exitValueClass}
            />
            <SummaryChip label={t('chipDocuments')} value={t('chipDocsRequired', { count: tr.documents.length })} />
            <SummaryChip
              label={t('chipConfidence')}
              value={tr.confidenceLevel === 'high' ? t('chipConfidenceHigh') : t('chipConfidenceMedium')}
              valueClass={tr.confidenceLevel === 'high' ? 'text-green-700' : 'text-amber-700'}
            />
          </div>

          {/* Nationality banner if applicable */}
          {tr.nationalityDependent && (
            <div className="mb-5">
              <NationalityBanner notes={tr.nationalityNotes ?? undefined} />
            </div>
          )}

          {/* Multi-hop guide if applicable */}
          {tr.ultimateDestination && (
            <div className="mb-5">
              <MultiHopGuide
                ultimateDestination={tr.ultimateDestination}
                fromCode={parsed.from}
                toCode={parsed.to}
              />
            </div>
          )}

          {/* Collapsible sections */}
          <div className="flex flex-col gap-2.5">
            {/* Key Requirements */}
            <AccordionSection icon="📋" title={t('sectionRequirements')}>
              <p className="text-sm leading-relaxed text-slate-700">{tr.requirements}</p>
              {tr.confidenceLevel === 'medium' && (
                <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {t('mediumConfidenceCaveat')}
                </p>
              )}
            </AccordionSection>

            {/* Required Documents */}
            <AccordionSection icon="📄" title={t('sectionDocuments')}>
              <ul className="flex flex-col gap-2 pt-1" role="list">
                {tr.documents.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-bold text-green-700"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="text-sm leading-snug text-slate-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </AccordionSection>

            {/* Process Timeline */}
            <AccordionSection icon="⏱️" title={t('sectionTimeline')}>
              <TransitionTimeline
                steps={[
                  { label: t('timelineStep1'), detail: t('timelineStep1Detail', { count: tr.documents.length }) },
                  { label: t('timelineStep2'), detail: tr.mustExitCountry ? t('timelineStep2Exit') : t('timelineStep2Local') },
                  { label: t('timelineStep3'), detail: tr.timeline },
                  { label: t('timelineStep4'), detail: t('timelineStep4Detail') },
                ]}
              />
            </AccordionSection>

            {/* Important Notes */}
            {tr.notes && (
              <AccordionSection icon="💡" title={t('sectionNotes')}>
                <p className="text-sm leading-relaxed text-slate-700">{tr.notes}</p>
              </AccordionSection>
            )}

            {/* The Bigger Picture — only if ultimateDestination exists */}
            {tr.ultimateDestination && (
              <AccordionSection icon="🗺️" title={t('sectionBiggerPicture')}>
                <p className="mb-3 text-sm leading-relaxed text-slate-700">
                  {t('biggerPictureBody')}
                </p>
                <div className="rounded-lg border border-[rgba(27,73,101,0.15)] bg-[#e8f0f5] p-3">
                  <p className="text-sm font-semibold text-[#1B4965]">{tr.ultimateDestination}</p>
                </div>
              </AccordionSection>
            )}
          </div>

          {/* Source link */}
          {tr.sourceUrl && (
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Source: </span>
              <a
                href={tr.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1B4965] underline underline-offset-2 hover:text-[#2e6b92]"
              >
                {tr.sourceUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            </div>
          )}

          {/* Last updated */}
          {tr.lastUpdated && (
            <p className="mt-1 text-xs text-slate-400">Last updated: {tr.lastUpdated}</p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <Link
              href={`/${country}/visa/change?from=${parsed.from}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1B4965] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('backToOptions', { from: fromCode })}
            </Link>
            <Link
              href={`/${country}/visa/${parsed.to}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1B4965] hover:underline"
            >
              {t('viewToDetails', { to: toCode })}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Other paths from same source */}
          {otherPaths.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-base font-bold text-foreground">
                {t('otherPathsFrom', { from: fromCode })}
              </h2>
              <div className="flex flex-col gap-2">
                {otherPaths.map((path) => (
                  <Link
                    key={path.type}
                    href={`/${country}/visa/change/${parsed.from}-to-${path.type}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm hover:border-[#1B4965] hover:shadow-sm"
                  >
                    <span>
                      <span className="font-bold text-[#1B4965]">
                        {fromCode} → {path.type.toUpperCase()}
                      </span>
                      <span className="ml-2 text-slate-500">{path.name}</span>
                    </span>
                    <ChevronRightIcon />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer BELOW */}
          <div className="mt-8">
            <ChangeDisclaimer position="below" />
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummaryChip({
  label,
  value,
  valueClass = 'text-[#1B4965]',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-center">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-sm font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  );
}

function AccordionSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-4 [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#e8f0f5] text-sm"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
        <svg
          className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 pt-0">{children}</div>
    </details>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
