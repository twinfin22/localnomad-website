import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VisaPathSimulator } from "@/components/visa/path";
import { AnimatedSection } from "@/components/animated-section";
import { Route, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  countryNames,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface PathPageProps {
  params: Promise<{ lang: string; country: string }>;
}

// Generate static params for all locale/country combos
export async function generateStaticParams() {
  const params: { lang: string; country: string }[] = [];

  for (const country of countries) {
    for (const lang of locales) {
      if (isLocaleAvailableForCountry(lang, country)) {
        // Currently only Korea has visa data
        if (country === "korea") {
          params.push({ lang, country });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PathPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Visa Path Simulator | LocalNomad`,
    description: `Explore visa transition paths for ${countryName}. See how to go from your current visa to your goal — with requirements, timelines, and tips at each step.`,
  };
}

export default async function VisaPathPage({ params }: PathPageProps) {
  const { lang, country: countryParam } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 relative overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto max-w-2xl relative z-10">
          <AnimatedSection>
            <Link
              href={buildHref("/visa")}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Guide
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Route className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Visa Path Simulator
                </h1>
                <p className="text-muted-foreground">
                  Plan your visa journey step by step
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Simulator */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl">
          <VisaPathSimulator lang={lang} country={countryParam} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
