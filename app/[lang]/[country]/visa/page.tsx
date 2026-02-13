import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  SituationGrid,
  MoreSituations,
  AlreadyHaveVisa,
  type Situation,
} from "@/components/visa/landing";
import { LegalDisclaimer } from "@/components/visa/LegalDisclaimer";
import {
  countryNames,
  countryLocales,
  buildLocalePath,
  type Locale,
  type Country,
  countries,
} from "@/lib/i18n/config";
import { Check, Route, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface VisaLandingProps {
  params: Promise<{ lang: string; country: string }>;
}

// Generate static params for all locale/country combos
export async function generateStaticParams() {
  const params: { lang: string; country: string }[] = [];

  for (const country of countries) {
    const availableLocales = countryLocales[country];
    for (const lang of availableLocales) {
      params.push({ lang, country });
    }
  }

  return params;
}

export async function generateMetadata({ params }: VisaLandingProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];
  const t = await getTranslations();

  return {
    title: `${t('visa.pageTitle', { country: countryName })} | LocalNomad`,
    description: t('visa.pageDescription', { country: countryName }),
    openGraph: {
      title: `${t('visa.pageTitle', { country: countryName })} | LocalNomad`,
      description: t('visa.pageDescription', { country: countryName }),
    },
  };
}

// =============================================================================
// Taiwan Situation Data
// =============================================================================

function getTaiwanSituations(
  t: Awaited<ReturnType<typeof getTranslations>>,
  buildHref: (path: string) => string
): { primary: Situation[]; more: Situation[] } {
  const primary: Situation[] = [
    {
      emoji: "\u{1F3C6}",
      situation: t.has('visa.tw.situationGoldCard')
        ? t('visa.tw.situationGoldCard')
        : "I'm a senior professional (tech, finance, etc.)",
      visa: "Gold Card",
      href: buildHref("/visa/gold-card"),
    },
    {
      emoji: "\u{1F4BB}",
      situation: t.has('visa.tw.situationDNV')
        ? t('visa.tw.situationDNV')
        : "I want to work remotely from Taiwan",
      visa: "DNV",
      href: buildHref("/visa/dnv"),
    },
    {
      emoji: "\u{1F4BC}",
      situation: t.has('visa.tw.situationWorkARC')
        ? t('visa.tw.situationWorkARC')
        : "I have a job offer in Taiwan",
      visa: "Work ARC",
      href: buildHref("/visa/work-arc"),
    },
    {
      emoji: "\u2708\uFE0F",
      situation: t.has('visa.tw.situationVisitor')
        ? t('visa.tw.situationVisitor')
        : "I'm visiting Taiwan short-term",
      visa: "Visitor",
      href: buildHref("/visa/visitor"),
    },
  ];

  const more: Situation[] = [
    {
      emoji: "\u{1F680}",
      situation: t.has('visa.tw.situationEntrepreneur')
        ? t('visa.tw.situationEntrepreneur')
        : "I want to start a business in Taiwan",
      visa: "Entrepreneur",
      href: buildHref("/visa/entrepreneur"),
    },
    {
      emoji: "\u{1F393}",
      situation: t.has('visa.tw.situationStudent')
        ? t('visa.tw.situationStudent')
        : "I want to study in Taiwan",
      visa: "Student",
      href: buildHref("/visa/student"),
    },
    {
      emoji: "\u{1F3E0}",
      situation: t.has('visa.tw.situationAPRC')
        ? t('visa.tw.situationAPRC')
        : "I want permanent residence (APRC)",
      visa: "APRC",
      href: buildHref("/visa/aprc"),
    },
  ];

  return { primary, more };
}

// =============================================================================
// Korea Situation Data (extracted from original page)
// =============================================================================

function getKoreaSituations(
  t: Awaited<ReturnType<typeof getTranslations>>,
  buildHref: (path: string) => string
): { primary: Situation[]; more: Situation[] } {
  const primary: Situation[] = [
    {
      emoji: "\u{1F4BC}",
      situation: t('visa.situationJobOffer'),
      visa: "E-7",
      href: buildHref("/visa/e-7"),
    },
    {
      emoji: "\u{1F393}",
      situation: t('visa.situationStudy'),
      visa: "D-2",
      href: buildHref("/visa/d-2"),
    },
    {
      emoji: "\u{1F4BB}",
      situation: t('visa.situationRemoteWork'),
      visa: "F-1-D",
      href: buildHref("/visa/f-1-d"),
    },
    {
      emoji: "\u{1F50D}",
      situation: t('visa.situationJobSeeking'),
      visa: "D-10",
      href: buildHref("/visa/d-10"),
    },
    {
      emoji: "\u2708\uFE0F",
      situation: t('visa.situationWorkingHoliday'),
      visa: "H-1",
      href: buildHref("/visa/h-1"),
    },
    {
      emoji: "\u{1F3E0}",
      situation: t('visa.situationLongTerm'),
      visa: "F-2",
      href: buildHref("/visa/f-2"),
    },
  ];

  const more: Situation[] = [
    {
      emoji: "\u{1F469}\u200D\u{1F3EB}",
      situation: t('visa.situationTeachEnglish'),
      visa: "E-2",
      href: buildHref("/visa/e-2"),
    },
    {
      emoji: "\u{1F3E2}",
      situation: t('visa.situationCompanyTransfer'),
      visa: "D-7",
      href: buildHref("/visa/d-7"),
    },
    {
      emoji: "\u{1F4B0}",
      situation: t('visa.situationStartBusiness'),
      visa: "D-8",
      href: buildHref("/visa/d-8"),
    },
    {
      emoji: "\u{1F48D}",
      situation: t('visa.situationMarried'),
      visa: "F-6",
      href: buildHref("/visa/f-6"),
    },
    {
      emoji: "\u{1F1F0}\u{1F1F7}",
      situation: t('visa.situationOverseasKorean'),
      visa: "F-4",
      href: buildHref("/visa/f-4"),
    },
    {
      emoji: "\u{1F4DA}",
      situation: t('visa.situationLanguageCourse'),
      visa: "D-4",
      href: buildHref("/visa/d-4"),
    },
  ];

  return { primary, more };
}

export default async function VisaLandingPage({ params }: VisaLandingProps) {
  const { lang, country: countryParam } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;
  const t = await getTranslations();

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  const isTaiwan = country === "taiwan";

  // Get country-specific situations
  const { primary: primarySituations, more: moreSituations } = isTaiwan
    ? getTaiwanSituations(t, buildHref)
    : getKoreaSituations(t, buildHref);

  // Visa options for "Already have a visa?" picker
  const visaOptions = isTaiwan
    ? [
        { visa: "Gold Card", name: "Employment Gold Card", href: buildHref("/visa/gold-card#after-approval") },
        { visa: "DNV", name: "Digital Nomad Visa", href: buildHref("/visa/dnv#after-approval") },
        { visa: "Work ARC", name: "Work ARC", href: buildHref("/visa/work-arc#after-approval") },
        { visa: "Visitor", name: "Visitor Visa", href: buildHref("/visa/visitor#after-approval") },
      ]
    : [
        { visa: "E-7", name: t('visa.visaNameEmployment'), href: buildHref("/visa/e-7#after-approval") },
        { visa: "D-2", name: t('visa.visaNameStudy'), href: buildHref("/visa/d-2#after-approval") },
        { visa: "F-1-D", name: t('visa.visaNameDigitalNomad'), href: buildHref("/visa/f-1-d#after-approval") },
        { visa: "D-10", name: t('visa.visaNameJobSeeking'), href: buildHref("/visa/d-10#after-approval") },
        { visa: "H-1", name: t('visa.visaNameWorkingHoliday'), href: buildHref("/visa/h-1#after-approval") },
        { visa: "F-2", name: t('visa.visaNameResidence'), href: buildHref("/visa/f-2#after-approval") },
      ];

  // Build JSON-LD structured data for the visa landing page
  const allSituations = [...primarySituations, ...moreSituations];
  const landingJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${countryNames[country][locale]} Visa Guide`,
    description: `Navigate ${countryNames[country][locale]} visa requirements with step-by-step guides, document checklists, and progress tracking.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allSituations.map((situation, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${situation.visa} Visa — ${situation.situation}`,
        url: `https://localnomad.club${situation.href}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }}
      />
      <main className="min-h-screen overflow-x-hidden bg-background">
        <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t('visa.whatsYourSituation')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('visa.selectSituationDesc')}
            </p>
          </div>

          {/* Primary situation tiles */}
          <SituationGrid situations={primarySituations} />

          {/* Show more situations */}
          {moreSituations.length > 0 && (
            <div className="mt-8">
              <MoreSituations situations={moreSituations} />
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-3xl px-4">
        <hr className="border-border" />
      </div>

      {/* Already have a visa section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <AlreadyHaveVisa
            visaOptions={visaOptions}
            pathSimulatorHref={buildHref("/visa/path")}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-3xl px-4">
        <hr className="border-border" />
      </div>

      {/* Path Simulator CTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <Link href={buildHref("/visa/path")} className="block group">
            <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-surface hover:border-primary/30 hover:bg-elevated transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Route className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Visa Path Simulator
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your visa transitions step by step — see how to get from your current visa to your goal.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-3xl px-4">
        <hr className="border-border" />
      </div>

      {/* Compare link + Trust badges */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          {/* Compare link */}
          <Link
            href={buildHref("/visa/compare")}
            className="text-primary hover:text-accent-hover transition-colors duration-200"
          >
            {t('visa.compareAllVisaTypes')} →
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>{t('visa.freeToUse')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>{t('visa.noAccountRequired')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              <span>{t('visa.updatedRegularly')}</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 text-xs text-muted-foreground">
            {t('visa.statsBar')}
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-12 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <LegalDisclaimer variant="box" country={isTaiwan ? 'tw' : 'kr'} />
        </div>
      </section>

      <Footer />
    </main>
    </>
  );
}
