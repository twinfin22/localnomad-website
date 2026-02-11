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
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";
import { Check } from "lucide-react";

interface VisaLandingProps {
  params: Promise<{ lang: string; country: string }>;
}

export async function generateMetadata({ params }: VisaLandingProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `${countryName} Visa Guide | LocalNomad`,
    description: `Navigate ${countryName} visa requirements with step-by-step guides, document checklists, and progress tracking. Find the right visa for your situation.`,
  };
}

export default async function VisaLandingPage({ params }: VisaLandingProps) {
  const { lang, country: countryParam } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  // Primary situations (always visible) - 6 most common
  const primarySituations: Situation[] = [
    {
      emoji: "💼",
      situation: "I have a job offer in Korea",
      visa: "E-7",
      href: buildHref("/visa/e-7"),
    },
    {
      emoji: "🎓",
      situation: "I want to study in Korea",
      visa: "D-2",
      href: buildHref("/visa/d-2"),
    },
    {
      emoji: "💻",
      situation: "I want to work remotely from Korea",
      visa: "F-1-D",
      href: buildHref("/visa/f-1-d"),
    },
    {
      emoji: "🔍",
      situation: "I'm looking for a job in Korea",
      visa: "D-10",
      href: buildHref("/visa/d-10"),
    },
    {
      emoji: "✈️",
      situation: "I want a working holiday in Korea",
      visa: "H-1",
      href: buildHref("/visa/h-1"),
    },
    {
      emoji: "🏠",
      situation: "I want to live long-term in Korea",
      visa: "F-2",
      href: buildHref("/visa/f-2"),
    },
  ];

  // Additional situations (behind "Show more")
  const moreSituations: Situation[] = [
    {
      emoji: "👩‍🏫",
      situation: "I want to teach English in Korea",
      visa: "E-2",
      href: buildHref("/visa/e-2"),
    },
    {
      emoji: "🏢",
      situation: "My company is transferring me to Korea",
      visa: "D-7",
      href: buildHref("/visa/d-7"),
    },
    {
      emoji: "💰",
      situation: "I want to start a business in Korea",
      visa: "D-8",
      href: buildHref("/visa/d-8"),
    },
    {
      emoji: "💍",
      situation: "I'm married to a Korean citizen",
      visa: "F-6",
      href: buildHref("/visa/f-6"),
    },
    {
      emoji: "🇰🇷",
      situation: "I'm an overseas Korean (교포)",
      visa: "F-4",
      href: buildHref("/visa/f-4"),
    },
    {
      emoji: "📚",
      situation: "I want to take a language course",
      visa: "D-4",
      href: buildHref("/visa/d-4"),
    },
  ];

  // Visa options for "Already have a visa?" picker
  const visaOptions = [
    { visa: "E-7", name: "Employment", href: buildHref("/visa/e-7#after-approval") },
    { visa: "D-2", name: "Study", href: buildHref("/visa/d-2#after-approval") },
    { visa: "F-1-D", name: "Digital Nomad", href: buildHref("/visa/f-1-d#after-approval") },
    { visa: "D-10", name: "Job Seeking", href: buildHref("/visa/d-10#after-approval") },
    { visa: "H-1", name: "Working Holiday", href: buildHref("/visa/h-1#after-approval") },
    { visa: "F-2", name: "Residence", href: buildHref("/visa/f-2#after-approval") },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B1120]">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              What's your situation?
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Select your situation and we'll guide you through the visa process
              step by step.
            </p>
          </div>

          {/* Primary situation tiles */}
          <SituationGrid situations={primarySituations} />

          {/* Show more situations */}
          <div className="mt-8">
            <MoreSituations situations={moreSituations} />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-5xl px-4">
        <hr className="border-slate-800" />
      </div>

      {/* Already have a visa section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <AlreadyHaveVisa visaOptions={visaOptions} />
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-5xl px-4">
        <hr className="border-slate-800" />
      </div>

      {/* Compare link + Trust badges */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Compare link */}
          <Link
            href={buildHref("/visa/compare")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            or compare all visa types →
          </Link>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>No account required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Updated regularly</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 text-xs text-slate-500">
            12 visa types covered · Updated Feb 2026 · Based on official requirements
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-12 px-4 sm:px-6 bg-[#0B1120]">
        <div className="container mx-auto max-w-4xl">
          <LegalDisclaimer variant="box" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
