import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/config";

/**
 * Root page — redirects to the default locale landing page.
 * At runtime, middleware rewrites "/" → "/en" so this rarely executes,
 * but it must exist for static pre-rendering to succeed without
 * the NextIntlClientProvider context.
 */
export default function Page() {
  redirect(`/${defaultLocale}`);
}
