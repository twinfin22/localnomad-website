import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getAllTransitionPairs, getTransitionDetail } from '@/lib/visa-transitions';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';
import type { Country } from '@/lib/types/visa';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
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
  const parsed = parseTransitionSlug(transition);
  if (!parsed) return { title: 'Visa Change | LocalNomad' };

  const detail = await getTransitionDetail(country as Country, parsed.from, parsed.to, locale);
  if (!detail) return { title: 'Visa Change | LocalNomad' };

  const { fromVisa, toVisa, transition: t } = detail;
  const year = new Date().getFullYear();
  const title = `${parsed.from.toUpperCase()} to ${parsed.to.toUpperCase()} Visa Change - Korea ${year} | LocalNomad`;
  const description = `Requirements, timeline and documents for changing from ${fromVisa?.shortName ?? parsed.from.toUpperCase()} to ${toVisa?.shortName ?? parsed.to.toUpperCase()} in Korea. ${t.requirements.slice(0, 100)}`;
  const alternates = getAlternates(locale, `/${country}/visa/change/${transition}`);

  return {
    title,
    description: description.slice(0, 200),
    alternates,
    openGraph: {
      title,
      description: description.slice(0, 200),
      type: 'article',
      siteName: 'LocalNomad',
      url: `https://localnomad.club/${locale}/${country}/visa/change/${transition}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 200),
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

  const { fromVisa, toVisa, transition: t } = detail;

  const displayCountry = country === 'korea' ? 'South Korea' : country;
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
    author: { '@type': 'Organization', name: 'LocalNomad' },
    publisher: { '@type': 'Organization', name: 'LocalNomad', url: 'https://localnomad.club' },
    dateModified: t.lastUpdated ?? new Date().toISOString().slice(0, 10),
    url: `https://localnomad.club/${locale}/${country}/visa/change/${transition}`,
  };

  // Schema.org BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://localnomad.club/${locale}` },
      { '@type': 'ListItem', position: 2, name: displayCountry, item: `https://localnomad.club/${locale}/${country}` },
      { '@type': 'ListItem', position: 3, name: 'Change Visa Status', item: `https://localnomad.club/${locale}/${country}/visa/change` },
      { '@type': 'ListItem', position: 4, name: `${fromCode} → ${toCode}`, item: `https://localnomad.club/${locale}/${country}/visa/change/${transition}` },
    ],
  };

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
            { label: 'Home', href: '/' },
            { label: displayCountry, href: `/${country}` },
            { label: 'Change Status', href: `/${country}/visa/change` },
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
          <p className="mb-5 text-sm text-slate-500">Korea · Visa Status Change</p>

          {/* Summary chips 2×2 grid */}
          <div className="mb-6 grid grid-cols-2 gap-2">
            <SummaryChip label="Timeline" value={t.timeline} />
            <SummaryChip
              label="Exit required?"
              value={
                t.nationalityDependent
                  ? 'Depends on passport'
                  : t.mustExitCountry
                  ? 'Must exit Korea'
                  : 'In-country'
              }
              valueClass={
                t.nationalityDependent
                  ? 'text-amber-700'
                  : t.mustExitCountry
                  ? 'text-[#D64045]'
                  : 'text-green-700'
              }
            />
            <SummaryChip label="Documents" value={`${t.documents.length} required`} />
            <SummaryChip
              label="Confidence"
              value={t.confidenceLevel === 'high' ? 'High' : 'Medium — verify'}
              valueClass={t.confidenceLevel === 'high' ? 'text-green-700' : 'text-amber-700'}
            />
          </div>

          {/* Nationality banner if applicable */}
          {t.nationalityDependent && (
            <div className="mb-5">
              <NationalityBanner notes={t.nationalityNotes ?? undefined} />
            </div>
          )}

          {/* Multi-hop guide if applicable */}
          {t.ultimateDestination && (
            <div className="mb-5">
              <MultiHopGuide
                ultimateDestination={t.ultimateDestination}
                fromCode={parsed.from}
                toCode={parsed.to}
              />
            </div>
          )}

          {/* Collapsible sections */}
          <div className="flex flex-col gap-2.5">
            {/* Key Requirements */}
            <AccordionSection icon="📋" title="Key Requirements">
              <p className="text-sm leading-relaxed text-slate-700">{t.requirements}</p>
              {t.confidenceLevel === 'medium' && (
                <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Medium confidence — verify this path with your local immigration office before
                  proceeding.
                </p>
              )}
            </AccordionSection>

            {/* Required Documents */}
            <AccordionSection icon="📄" title="Required Documents">
              <ul className="flex flex-col gap-2 pt-1" role="list">
                {t.documents.map((doc, i) => (
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
            <AccordionSection icon="⏱️" title="Process Timeline">
              <TransitionTimeline
                steps={[
                  { label: 'Prepare documents', detail: `Gather all ${t.documents.length} required documents listed above` },
                  { label: 'Submit application', detail: t.mustExitCountry ? 'Apply at Korean consulate/embassy in your country' : 'Submit at local Immigration Office (출입국관리사무소) in Korea' },
                  { label: 'Processing', detail: t.timeline },
                  { label: 'Receive new ARC', detail: 'Pick up updated Alien Registration Card' },
                ]}
              />
            </AccordionSection>

            {/* Important Notes */}
            {t.notes && (
              <AccordionSection icon="💡" title="Important Notes">
                <p className="text-sm leading-relaxed text-slate-700">{t.notes}</p>
              </AccordionSection>
            )}

            {/* The Bigger Picture — only if ultimateDestination exists */}
            {t.ultimateDestination && (
              <AccordionSection icon="🗺️" title="The Bigger Picture">
                <p className="mb-3 text-sm leading-relaxed text-slate-700">
                  This change is part of a longer path to permanent residence in Korea:
                </p>
                <div className="rounded-lg border border-[rgba(27,73,101,0.15)] bg-[#e8f0f5] p-3">
                  <p className="text-sm font-semibold text-[#1B4965]">{t.ultimateDestination}</p>
                </div>
              </AccordionSection>
            )}
          </div>

          {/* Source link */}
          {t.sourceUrl && (
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Source: </span>
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1B4965] underline underline-offset-2 hover:text-[#2e6b92]"
              >
                {t.sourceUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </a>
            </div>
          )}

          {/* Last updated */}
          {t.lastUpdated && (
            <p className="mt-1 text-xs text-slate-400">Last updated: {t.lastUpdated}</p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <Link
              href={`/${country}/visa/change?from=${parsed.from}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1B4965] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to {fromCode} options
            </Link>
            <Link
              href={`/${country}/visa/${parsed.to}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1B4965] hover:underline"
            >
              View {toCode} details
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Other paths from same source */}
          {otherPaths.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-base font-bold text-foreground">
                Other paths from {fromCode}
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
