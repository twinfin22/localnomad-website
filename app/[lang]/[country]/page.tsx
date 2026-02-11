import Link from "next/link";
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

  const countryName = countryNames[country][locale];
  const flag = countryFlags[country];

  // Build locale-aware href
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  // Services available per country
  const services = getServicesForCountry(country);

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
              Everything you need to live, work, and thrive in {countryName}.
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
        <span className="text-xs text-muted-foreground mt-4">Coming Soon</span>
      )}

      {available && (
        <div className="flex items-center text-primary mt-4">
          <span className="text-sm font-medium">Explore</span>
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

function getServicesForCountry(country: Country): ServiceConfig[] {
  const baseServices: ServiceConfig[] = [
    {
      name: "Visa Guide",
      description: "Find the right visa for your situation with step-by-step guides.",
      path: "/visa",
      icon: "visa",
      available: country === "korea",
    },
    {
      name: "Area Guide",
      description: "Discover neighborhoods and find your perfect place to live.",
      path: "/areas",
      icon: "area",
      available: country === "korea",
    },
    {
      name: "Info Bundles",
      description: "Curated resources to help you settle in quickly.",
      path: "/bundles",
      icon: "bundles",
      available: country === "korea",
    },
  ];

  return baseServices;
}
