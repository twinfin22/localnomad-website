import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SeoulNeighborhoodMap } from "@/components/SeoulNeighborhoodMap";
import { MapPin, FileSearch, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  countryNames,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface AreasPageProps {
  params: Promise<{ lang: string; country: string }>;
}

// Generate static params for all locale/country combos
export async function generateStaticParams() {
  const params: { lang: string; country: string }[] = [];

  for (const country of countries) {
    for (const lang of locales) {
      if (isLocaleAvailableForCountry(lang, country)) {
        // Currently only Korea has area data
        if (country === "korea") {
          params.push({ lang, country });
        }
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: AreasPageProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  const countryName = countryNames[country as Country][locale];
  const t = await getTranslations({ locale: lang, namespace: "areas" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription", { country: countryName }),
  };
}

export default async function AreasPage({ params }: AreasPageProps) {
  const { lang, country } = await params;
  const t = await getTranslations({ locale: lang, namespace: "areas" });

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />

      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 mx-auto">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t("pageTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <SeoulNeighborhoodMap />

      {/* Custom Report CTA */}
      <section className="py-20 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <FileSearch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {t("customReportTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              {t("customReportDesc")}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <Clock className="w-4 h-4" />
              <span>{t("turnaround")}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("requestReport")}
                </a>
              </Button>
              <div className="text-sm text-muted-foreground self-center">
                {t("startingAt")}{" "}
                <span className="font-semibold text-foreground">{t("startingPrice")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
