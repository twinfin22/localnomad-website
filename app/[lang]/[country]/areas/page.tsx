import { redirect } from "next/navigation";
import {
  buildLocalePath,
  type Locale,
  type Country,
} from "@/lib/i18n/config";

interface AreasPageProps {
  params: Promise<{ lang: string; country: string }>;
}

export default async function AreasPage({ params }: AreasPageProps) {
  const { lang, country } = await params;
  redirect(buildLocalePath("/visa", lang as Locale, country as Country));
}
