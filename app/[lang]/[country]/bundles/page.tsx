import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileText, Download, CheckCircle } from "lucide-react";
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
  const t = await getTranslations({ locale: lang, namespace: "bundles" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription", { country: countryName }),
  };
}

export default async function BundlesPage({ params }: BundlesPageProps) {
  const { lang, country } = await params;
  const t = await getTranslations({ locale: lang, namespace: "bundles" });

  const bundles = [
    {
      title: t("preArrivalChecklist"),
      description: t("preArrivalDesc"),
      price: t("preArrivalPrice"),
      features: [
        t("preArrivalFeature1"),
        t("preArrivalFeature2"),
        t("preArrivalFeature3"),
        t("preArrivalFeature4"),
        t("preArrivalFeature5"),
      ],
    },
    {
      title: t("seoulPlaybook"),
      description: t("seoulPlaybookDesc"),
      price: t("seoulPlaybookPrice"),
      features: [
        t("seoulPlaybookFeature1"),
        t("seoulPlaybookFeature2"),
        t("seoulPlaybookFeature3"),
        t("seoulPlaybookFeature4"),
        t("seoulPlaybookFeature5"),
      ],
    },
    {
      title: t("nomadCheatsheet"),
      description: t("nomadCheatsheetDesc"),
      price: t("nomadCheatsheetPrice"),
      features: [
        t("nomadCheatsheetFeature1"),
        t("nomadCheatsheetFeature2"),
        t("nomadCheatsheetFeature3"),
        t("nomadCheatsheetFeature4"),
        t("nomadCheatsheetFeature5"),
      ],
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header />

      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center mb-6 mx-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{t("pageTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
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
                  {t("getBundle")}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center p-8 bg-surface border border-border rounded-xl">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t("allAccessBundle")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("allAccessDesc")}
            </p>
            <div className="text-4xl font-bold text-foreground mb-6">
              {t("allAccessPrice")}{" "}
              <span className="text-lg text-muted-foreground line-through">
                {t("allAccessOriginalPrice")}
              </span>
            </div>
            <Button
              size="lg"
              variant="primary"
            >
              {t("getAllBundles")}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
