import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  countryNames,
  countryFlags,
  defaultLocale,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";
import { Briefcase, MapPin, Package } from "lucide-react";

interface CountryHubProps {
  params: Promise<{ lang: string; country: string }>;
}

export default async function CountryHubPage({ params }: CountryHubProps) {
  const { lang, country: countryParam } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;
  const t = await getTranslations();

  const countryName = countryNames[country][locale];
  const flag = countryFlags[country];

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  // Translated strings for services
  const translations = {
    visaGuide: t("countryHub.visaGuide"),
    visaGuideDesc: t("countryHub.visaGuideDesc"),
    areaGuide: t("countryHub.areaGuide"),
    areaGuideDesc: t("countryHub.areaGuideDesc"),
    bundles: t("countryHub.bundles"),
    bundlesDesc: t("countryHub.bundlesDesc"),
    comingSoon: t("common.comingSoon"),
    explore: t("common.learnMore"),
    exploreServices: t("countryHub.exploreServices", { country: countryName }),
  };

  // Services available per country
  const services = getServicesForCountry(country, translations);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

        <div className="container mx-auto max-w-3xl relative z-10">
          {/* Country Header */}
          <div className="text-center mb-12">
            <span className="text-6xl mb-4 block">{flag}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {countryName}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {translations.exploreServices}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {services.map((service) => (
              <ServiceCard
                key={service.name}
                name={service.name}
                description={service.description}
                href={service.available ? buildHref(service.path) : undefined}
                icon={service.icon}
                available={service.available}
                comingSoonLabel={translations.comingSoon}
                exploreLabel={translations.explore}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// =============================================================================
// Service Card Component
// =============================================================================

interface ServiceCardProps {
  name: string;
  description: string;
  href?: string;
  icon: "visa" | "area" | "bundles";
  available: boolean;
  comingSoonLabel: string;
  exploreLabel: string;
}

const icons = {
  visa: Briefcase,
  area: MapPin,
  bundles: Package,
};

function ServiceCard({
  name,
  description,
  href,
  icon,
  available,
  comingSoonLabel,
  exploreLabel,
}: ServiceCardProps) {
  const Icon = icons[icon];

  const content = (
    <div
      className={`relative rounded-xl p-6 h-full flex flex-col transition-all duration-200 ${
        available
          ? "bg-surface border border-border hover:border-border-hover hover:bg-elevated cursor-pointer"
          : "bg-surface/50 border border-border/50 opacity-60"
      }`}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>

      {/* Name */}
      <h2 className="text-xl font-bold text-foreground mb-2">{name}</h2>

      {/* Description */}
      <p className="text-sm text-muted-foreground flex-1">{description}</p>

      {/* Status */}
      {!available && (
        <span className="text-xs text-muted-foreground mt-4">{comingSoonLabel}</span>
      )}

      {available && (
        <div className="flex items-center text-primary mt-4">
          <span className="text-sm font-medium">{exploreLabel}</span>
          <span className="ml-2">→</span>
        </div>
      )}
    </div>
  );

  if (available && href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// =============================================================================
// Helpers
// =============================================================================

interface ServiceConfig {
  name: string;
  description: string;
  path: string;
  icon: "visa" | "area" | "bundles";
  available: boolean;
}

interface ServiceTranslations {
  visaGuide: string;
  visaGuideDesc: string;
  areaGuide: string;
  areaGuideDesc: string;
  bundles: string;
  bundlesDesc: string;
}

function getServicesForCountry(country: Country, t: ServiceTranslations): ServiceConfig[] {
  const baseServices: ServiceConfig[] = [
    {
      name: t.visaGuide,
      description: t.visaGuideDesc,
      path: "/visa",
      icon: "visa",
      available: country === "korea",
    },
    {
      name: t.areaGuide,
      description: t.areaGuideDesc,
      path: "/areas",
      icon: "area",
      available: country === "korea",
    },
    {
      name: t.bundles,
      description: t.bundlesDesc,
      path: "/bundles",
      icon: "bundles",
      available: country === "korea",
    },
  ];

  return baseServices;
}
