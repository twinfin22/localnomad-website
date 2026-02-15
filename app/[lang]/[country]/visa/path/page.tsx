import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VisaPathSimulator } from "@/components/visa/path";
import { AnimatedSection } from "@/components/animated-section";
import { Route, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  countries,
  countryLocales,
  countryNames,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";
import { generateAlternates } from "@/lib/seo/metadata";

interface PathPageProps {
  params: Promise<{ lang: string; country: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
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

export async function generateMetadata({ params }: PathPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Visa Path Simulator | LocalNomad`,
    description: `Explore visa transition paths for ${countryName}. See how to go from your current visa to your goal — with requirements, timelines, and tips at each step.`,
    alternates: generateAlternates({ path: "/visa/path", locale, country: country as Country }),
  };
}

export default async function VisaPathPage({
  params,
  searchParams,
}: PathPageProps) {
  const { lang, country: countryParam } = await params;
  const { from, to } = await searchParams;
  const locale = lang as Locale;
  const country = countryParam as Country;

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Visa Path Simulator",
    description: `Plan your ${countryNames[country][locale]} visa transition path`,
    url: `https://localnomad.club/${lang}/${countryParam}/visa/path`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header locale={locale} country={country} />

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
          <Suspense
            fallback={
              <div className="w-full max-w-2xl mx-auto animate-pulse space-y-4">
                <div className="h-16 bg-elevated rounded-xl" />
                <div className="h-10 bg-elevated rounded-lg" />
                <div className="h-40 bg-elevated rounded-xl" />
              </div>
            }
          >
            <VisaPathSimulator
              lang={lang}
              country={countryParam}
              initialFrom={from ?? null}
              initialTo={to ?? null}
            />
          </Suspense>
        </div>
      </section>

      <Footer locale={locale} country={country} />
    </main>
  );
}
