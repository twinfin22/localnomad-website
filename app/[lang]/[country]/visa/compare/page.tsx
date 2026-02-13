import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VisaComparisonTool } from "@/components/visa/VisaComparisonTool";
import { AnimatedSection } from "@/components/animated-section";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  countries,
  countryLocales,
  countryNames,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface ComparePageProps {
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

export async function generateMetadata({ params }: ComparePageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Compare Visas | LocalNomad Visa Guide`,
    description: `Compare ${countryName} visa types side-by-side. See differences in duration, requirements, work permissions, and more.`,
  };
}

export default async function VisaComparePage({ params }: ComparePageProps) {
  const { lang, country: countryParam } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header locale={locale} country={country} />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 relative overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <AnimatedSection>
            <Link
              href={buildHref("/visa")}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Visa Dashboard
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold ">
                  Compare Visas
                </h1>
                <p className="text-muted-foreground">
                  Side-by-side comparison of visa types
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Comparison Tool */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <VisaComparisonTool />
        </div>
      </section>

      <Footer locale={locale} country={country} />
    </main>
  );
}
