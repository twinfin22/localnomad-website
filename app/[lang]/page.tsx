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
    <main className="min-h-screen overflow-x-hidden bg-[#0B1120]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Your Toolkit for Living in Asia
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12">
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

          <p className="text-sm text-slate-500 mt-12">
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
      <div className="group relative rounded-2xl p-6 bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer text-left">
        {/* Flag & Name */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{flag}</span>
          <h2 className="text-2xl font-bold text-white">{name}</h2>
        </div>

        {/* Services */}
        <ul className="space-y-2 mb-6">
          {countryServices.map((service) => (
            <li
              key={service.name}
              className={`text-sm ${
                service.available ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {service.available ? "✓" : "○"} {service.name}
              {!service.available && (
                <span className="text-xs text-slate-600 ml-2">Coming Soon</span>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
          <span className="text-sm font-medium">Explore {name}</span>
          <span className="ml-2 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
