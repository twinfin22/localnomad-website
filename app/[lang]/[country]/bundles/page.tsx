import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileText, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  countryNames,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface BundlesPageProps {
  params: Promise<{ lang: string; country: string }>;
}

// Generate static params for all locale/country combos
export async function generateStaticParams() {
  const params: { lang: string; country: string }[] = [];

  for (const country of countries) {
    for (const lang of locales) {
      if (isLocaleAvailableForCountry(lang, country)) {
        // Currently only Korea has bundles
        if (country === "korea") {
          params.push({ lang, country });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: BundlesPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];

  return {
    title: `Info Bundles | LocalNomad`,
    description: `Curated guides, checklists, and playbooks to make your ${countryName} journey smooth.`,
  };
}

const bundles = [
  {
    title: "Pre-Arrival Checklist",
    description: "Everything you need to prepare before landing in Korea",
    price: "$19",
    features: [
      "Visa requirements overview",
      "Documents to prepare",
      "Banking setup guide",
      "Phone & SIM options",
      "First week essentials",
    ],
  },
  {
    title: "Seoul Survival Playbook",
    description: "Your complete guide to navigating daily life in Seoul",
    price: "$39",
    features: [
      "Transportation mastery",
      "Housing search guide",
      "Healthcare navigation",
      "Banking & finances",
      "Cultural tips & etiquette",
    ],
  },
  {
    title: "Digital Nomad Cheatsheet",
    description: "Quick reference for remote workers in Korea",
    price: "$29",
    features: [
      "Best coworking spaces",
      "Cafe work spots by area",
      "Fast WiFi locations",
      "Tax considerations",
      "Community connections",
    ],
  },
];

export default async function BundlesPage({ params }: BundlesPageProps) {
  const { lang, country } = await params;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center mb-6 mx-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Info Bundles</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated guides, checklists, and playbooks to make your Korea
              journey smooth
            </p>
          </div>

          <div className="space-y-6">
            {bundles.map((bundle, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-xl p-6 hover:border-border-hover hover:bg-elevated transition-all duration-200 cursor-pointer flex flex-col"
              >
                <h3 className="text-xl font-semibold text-foreground mb-2">{bundle.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {bundle.description}
                </p>

                <div className="text-3xl font-bold text-foreground mb-6">
                  {bundle.price}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {bundle.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="primary" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Get Bundle
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center p-8 bg-surface border border-border rounded-xl">
            <h2 className="text-2xl font-semibold text-foreground mb-2">All-Access Bundle</h2>
            <p className="text-muted-foreground mb-4">
              Get all three guides at a discounted price
            </p>
            <div className="text-4xl font-bold text-foreground mb-6">
              $69{" "}
              <span className="text-lg text-muted-foreground line-through">
                $87
              </span>
            </div>
            <Button
              size="lg"
              variant="primary"
            >
              Get All Bundles
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
