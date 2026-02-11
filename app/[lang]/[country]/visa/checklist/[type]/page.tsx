import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getVisaInfo, getVisaTypes } from "@/lib/visa/data";
import type { VisaType } from "@/lib/visa/types";
import { ChecklistPage } from "@/components/visa/checklist";
import {
  locales,
  countries,
  isLocaleAvailableForCountry,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface ChecklistTypePageProps {
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
export async function generateMetadata({ params }: ChecklistTypePageProps) {
  const { lang, type } = await params;
  const visa = getVisaInfo(type as VisaType, lang as Locale);

  if (!visa) {
    return {
      title: "Checklist Not Found | LocalNomad",
    };
  }

  return {
    title: `${visa.shortName} Document Checklist | LocalNomad`,
    description: `Complete document checklist for ${visa.name} application. Track your progress and never miss a required document.`,
  };
}

export default async function VisaChecklistTypePage({
  params,
}: ChecklistTypePageProps) {
  const { lang, type } = await params;
  const visa = getVisaInfo(type as VisaType, lang as Locale);

  if (!visa) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <ChecklistPage visa={visa} />
      <Footer />
    </main>
  );
}
