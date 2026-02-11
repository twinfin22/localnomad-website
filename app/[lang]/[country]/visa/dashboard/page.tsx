import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardClient } from "@/components/visa/dashboard";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  countryNames,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface DashboardPageProps {
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

export async function generateMetadata({ params }: DashboardPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Visa Dashboard | LocalNomad`,
    description: `Track your ${countryName} visa application progress with real-time status updates.`,
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang, country } = await params;

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <DashboardClient />
      <Footer />
    </main>
  );
}
