import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isValidLocale, type Locale } from "@/lib/i18n/config";

export default getRequestConfig(async () => {
  // Get locale from cookie (set by middleware)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;

  // Validate and fall back to default
  const locale: Locale =
    localeCookie && isValidLocale(localeCookie) ? localeCookie : defaultLocale;

  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    // Fall back to English if translation file doesn't exist
    messages = (await import("@/messages/en.json")).default;
  }

  return {
    locale,
    messages,
  };
});
