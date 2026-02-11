import type React from "react";
import { notFound } from "next/navigation";
import { CountryProvider } from "@/components/providers/country-provider";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

// =============================================================================
// Static Params
// =============================================================================

export function generateStaticParams() {
  const params: { lang: string; country: string }[] = [];

  for (const country of countries) {
    for (const lang of locales) {
      if (isLocaleAvailableForCountry(lang, country)) {
        params.push({ lang, country });
      }
    }
  }

  return params;
}

// =============================================================================
// Layout
// =============================================================================

interface CountryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string; country: string }>;
}

export default async function CountryLayout({
  children,
  params,
}: CountryLayoutProps) {
  const { lang, country } = await params;

  // Validate country
  if (!countries.includes(country as Country)) {
    notFound();
  }

  // Validate locale is available for this country
  if (!isLocaleAvailableForCountry(lang as Locale, country as Country)) {
    notFound();
  }

  return (
    <CountryProvider country={country as Country}>{children}</CountryProvider>
  );
}
