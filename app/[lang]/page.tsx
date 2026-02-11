import Link from "next/link";
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
  const { lang } = await params;
  const locale = lang as Locale;

  // Build locale-aware href
  const buildHref = (country: Country) => {
    return locale === defaultLocale ? `/${country}` : `/${locale}/${country}`;
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Your Toolkit for Living in Asia
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Navigate visas, find neighborhoods, and settle in with confidence.
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
            More countries coming soon.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// =============================================================================
// Country Card Component
// =============================================================================

interface CountryCardProps {
  country: Country;
  locale: Locale;
  href: string;
}

function CountryCard({ country, locale, href }: CountryCardProps) {
  const name = countryNames[country][locale];
  const flag = countryFlags[country];

  // Available services per country
  const services: Record<Country, { name: string; available: boolean }[]> = {
    korea: [
      { name: "Visa Guide", available: true },
      { name: "Area Guide", available: true },
      { name: "Bundles", available: true },
    ],
    taiwan: [
      { name: "Visa Guide", available: false },
      { name: "Area Guide", available: false },
    ],
  };

  const countryServices = services[country];

  return (
    <Link href={href}>
      <div className="group relative rounded-xl p-6 bg-surface border border-border hover:border-border-hover hover:bg-elevated transition-all duration-200 cursor-pointer text-left">
        {/* Flag & Name */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{flag}</span>
          <h2 className="text-2xl font-bold text-foreground">{name}</h2>
        </div>

        {/* Services */}
        <ul className="space-y-2 mb-6">
          {countryServices.map((service) => (
            <li
              key={service.name}
              className={`text-sm ${
                service.available ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}
            >
              {service.available ? "✓" : "○"} {service.name}
              {!service.available && (
                <span className="text-xs text-muted-foreground/50 ml-2">Coming Soon</span>
              )}
            </li>
          ))}
        </ul>

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
