import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getVisaInfo, getVisaTypes } from "@/lib/visa/data";
import type { VisaType } from "@/lib/visa/types";
import { VisaDetailContent } from "@/components/visa/VisaDetailContent";

interface VisaDetailPageProps {
  params: Promise<{ type: string }>;
}

// Generate static params for all visa types
export async function generateStaticParams() {
  const types = getVisaTypes();
  return types.map((type) => ({ type }));
}

// Generate metadata
export async function generateMetadata({ params }: VisaDetailPageProps) {
  const { type } = await params;
  const visa = getVisaInfo(type as VisaType, "en");

  if (!visa) {
    return {
      title: "Visa Not Found | LocalNomad",
    };
  }

  return {
    title: `${visa.name} (${visa.shortName}) | LocalNomad Visa Guide`,
    description: visa.description,
  };
}

export default async function VisaDetailPage({ params }: VisaDetailPageProps) {
  const { type } = await params;
  const visa = getVisaInfo(type as VisaType, "en");

  if (!visa) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <VisaDetailContent visa={visa} />
      <Footer />
    </main>
  );
}
