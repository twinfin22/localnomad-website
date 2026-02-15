import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VisaFinder } from "@/components/visa/quiz";
import {
  countries,
  countryLocales,
  countryNames,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";
import { generateAlternates } from "@/lib/seo/metadata";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface FindVisaPageProps {
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

export async function generateMetadata({ params }: FindVisaPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Find Your Visa | LocalNomad`,
    description: `Answer a few questions to find the best ${countryName} visa for your situation. Get personalized visa recommendations in 2 minutes.`,
    alternates: generateAlternates({ path: "/visa/find", locale, country: country as Country }),
  };
}

export default async function FindVisaPage({ params }: FindVisaPageProps) {
  const { lang, country: countryParam } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  // Taiwan quiz is Phase 2 — show "Coming Soon" for now
  if (country === "taiwan") {
    return (
      <main className="min-h-screen overflow-x-hidden bg-background">
        <Header locale={locale} country={country} />

        <section className="pt-28 pb-16 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl">
            <Link
              href={buildHref("/visa")}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Guide
            </Link>

            <div className="text-center py-16">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Visa Finder — Coming Soon
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                The Taiwan visa finder is currently under development. In the
                meantime, you can compare visa types side by side.
              </p>
              <Link
                href={buildHref("/visa/compare")}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Compare Visa Types
              </Link>
            </div>
          </div>
        </section>

        <Footer locale={locale} country={country} />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header locale={locale} country={country} />

      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <VisaFinder />
        </div>
      </section>

      <Footer locale={locale} country={country} />
    </main>
  );
}
