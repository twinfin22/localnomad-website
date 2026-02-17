import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  countries,
  countryNames,
  countryFlags,
  defaultLocale,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface GlobalLandingProps {
  params: Promise<{ lang: string }>;
}

export default async function GlobalLandingPage({ params }: GlobalLandingProps) {
  const [{ lang }, t] = await Promise.all([params, getTranslations()]);
  const locale = lang as Locale;

  // Country click → redirect to visa dashboard directly
  const buildHref = (country: Country) => {
    return locale === defaultLocale ? `/${country}/visa` : `/${locale}/${country}/visa`;
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header locale={locale} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t("home.headline")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            {t("home.subheadline")}
          </p>

          {/* Country Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {countries.map((country) => (
              <CountryCard
                key={country}
                country={country}
                locale={locale}
                href={buildHref(country)}
              />
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-12">
            {t("home.moreCountries")}
          </p>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

// =============================================================================
// Country Card Component (simplified — no service lists)
// =============================================================================

interface CountryCardProps {
  country: Country;
  locale: Locale;
  href: string;
}

function CountryCard({ country, locale, href }: CountryCardProps) {
  const name = countryNames[country][locale];
  const flag = countryFlags[country];

  return (
    <Link href={href}>
      <div className="group relative rounded-xl p-6 bg-surface border border-border hover:border-border-hover hover:bg-elevated transition-all duration-200 cursor-pointer text-left">
        {/* Flag & Name */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{flag}</span>
          <h2 className="text-2xl font-bold text-foreground">{name}</h2>
        </div>

        {/* CTA */}
        <div className="flex items-center text-primary group-hover:text-accent-hover transition-colors duration-200">
          <span className="text-sm font-medium">Explore {name}</span>
          <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
