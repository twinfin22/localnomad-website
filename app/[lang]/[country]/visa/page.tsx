import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getAllVisas } from "@/lib/visa/data";
import {
  VisaHero,
  SocialProofBar,
  VisaCardsGrid,
  UndecidedCTA,
} from "@/components/visa/landing";
import { LegalDisclaimer } from "@/components/visa/LegalDisclaimer";
import { AnimatedSection } from "@/components/animated-section";
import {
  countryNames,
  defaultLocale,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

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

  // Get all visas for this country (currently only Korea has visa data)
  const visas = getAllVisas(locale);

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  const countryName = countryNames[country][locale];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B1120]">
      <Header />

      {/* Hero Section */}
      <VisaHero
        headline="Not sure which visa you need?"
        subheadline="Answer 5 questions. Get your personalized visa path in 2 minutes."
        ctaText="Find My Visa"
        ctaHref={buildHref("/visa/find")}
        secondaryCtaText="Browse All Visas"
        secondaryCtaHref="#visa-grid"
      />

      {/* Social Proof */}
      <SocialProofBar className="bg-[#0F172A] border-y border-slate-800" />

      {/* Visa Cards Grid */}
      <VisaCardsGrid
        visas={visas}
        title="Explore Visa Types"
        subtitle={`Select a visa to view detailed requirements, documents, and step-by-step guides for ${countryName}`}
      />

      {/* Undecided CTA */}
      <UndecidedCTA
        title="Still not sure?"
        subtitle={`${countryName} visa paths can be confusing. Let us help you figure out the best option for your situation.`}
        ctaText="Take the Quiz"
        ctaHref={buildHref("/visa/find")}
      />

      {/* Legal Disclaimer */}
      <section className="py-12 px-4 sm:px-6 bg-[#0B1120]">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection>
            <LegalDisclaimer variant="box" />
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
