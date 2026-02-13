import { redirect } from "next/navigation";
import {
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface CountryHubProps {
  params: Promise<{ lang: string; country: string }>;
}

export default async function CountryHubPage({ params }: CountryHubProps) {
  const { lang, country } = await params;
  const locale = lang as Locale;
  redirect(buildLocalePath("/visa", locale, country as Country));
}
