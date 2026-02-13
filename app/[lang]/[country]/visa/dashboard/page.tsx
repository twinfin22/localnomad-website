import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DashboardClient } from "@/components/visa/dashboard";
import {
  countries,
  countryLocales,
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
    const availableLocales = countryLocales[country];
    for (const lang of availableLocales) {
      params.push({ lang, country });
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
  const locale = lang as Locale;
  const countryTyped = country as Country;

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header locale={locale} country={countryTyped} />
      <Suspense fallback={
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-surface rounded" />
              <div className="h-32 bg-surface rounded-2xl" />
            </div>
          </div>
        </div>
      }>
        <DashboardClient />
      </Suspense>
      <Footer locale={locale} country={countryTyped} />
    </main>
  );
}
