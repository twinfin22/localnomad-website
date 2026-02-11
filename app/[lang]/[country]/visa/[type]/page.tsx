import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getVisaInfo, getVisaTypes } from "@/lib/visa/data";
import type { VisaType } from "@/lib/visa/types";
import { VisaJourneyPage, VisaStubPage } from "@/components/visa/journey";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface VisaDetailPageProps {
  params: Promise<{ lang: string; country: string; type: string }>;
}

// Generate static params for all visa types across all locale/country combos
export async function generateStaticParams() {
  const types = getVisaTypes();
  const params: { lang: string; country: string; type: string }[] = [];

  for (const country of countries) {
    for (const lang of locales) {
      if (isLocaleAvailableForCountry(lang, country)) {
        // Currently only Korea has visa data
        if (country === "korea") {
          for (const type of types) {
            params.push({ lang, country, type });
          }
        }
      }
    }
  }

  return params;
}

// Generate metadata
export async function generateMetadata({ params }: VisaDetailPageProps) {
  const { lang, type } = await params;
  const visa = getVisaInfo(type as VisaType, lang as Locale);

  if (!visa) {
    return {
      title: "Visa Not Found | LocalNomad",
    };
  }

  return {
    title: `${visa.name} (${visa.shortName}) | LocalNomad Visa Guide`,
    description: visa.description,
    openGraph: {
      title: `${visa.name} (${visa.shortName}) | LocalNomad Visa Guide`,
      description: visa.description,
    },
  };
}

export default async function VisaTypePage({ params }: VisaDetailPageProps) {
  const { lang, country: countryParam, type } = await params;
  const locale = lang as Locale;
  const country = countryParam as Country;
  const visa = getVisaInfo(type as VisaType, locale);

  if (!visa) {
    notFound();
  }

  // Build locale-aware hrefs
  const buildHref = (path: string) => buildLocalePath(path, locale, country);

  // Build FAQ JSON-LD structured data
  const faqJsonLd =
    visa.faqs && visa.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: visa.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  // Render stub page for coming-soon visas
  if (visa.isStub) {
    return (
      <>
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
        <main className="min-h-screen overflow-x-hidden">
          <Header />
          <VisaStubPage
            visa={visa}
            backHref={buildHref("/visa")}
          />
          <Footer />
        </main>
      </>
    );
  }

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <main className="min-h-screen overflow-x-hidden">
        <Header />
        <VisaJourneyPage
          visa={visa}
          backHref={buildHref("/visa")}
          dashboardHref={buildHref("/visa/dashboard")}
          checklistHref={buildHref(`/visa/checklist/${type}`)}
          pathSimulatorHref={buildHref("/visa/path")}
        />
        <Footer />
      </main>
    </>
  );
}
