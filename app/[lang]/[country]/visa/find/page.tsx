import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VisaFinder } from "@/components/visa/quiz";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  countryNames,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface FindVisaPageProps {
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

export async function generateMetadata({ params }: FindVisaPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Find Your Visa | LocalNomad`,
    description: `Answer a few questions to find the best ${countryName} visa for your situation. Get personalized visa recommendations in 2 minutes.`,
  };
}

export default async function FindVisaPage({ params }: FindVisaPageProps) {
  const { lang, country } = await params;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B1120]">
      <Header />

      <section className="pt-24 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <VisaFinder />
        </div>
      </section>

      <Footer />
    </main>
  );
}
