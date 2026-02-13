import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getLocale } from "next-intl/server"
import type { Locale } from "@/lib/i18n/config"
import {
  BusinessHeroSection,
  BusinessProblemSection,
  BusinessWhyUsSection,
  BusinessServicesSection,
  BusinessHowItWorksSection,
  BusinessNotForSection,
  BusinessCtaSection
} from "@/components/business"

export default async function BusinessPage() {
  const locale = await getLocale() as Locale;

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header locale={locale} />
      <BusinessHeroSection />
      <BusinessProblemSection />
      <BusinessWhyUsSection />
      <BusinessServicesSection />
      <BusinessHowItWorksSection />
      <BusinessNotForSection />
      <BusinessCtaSection />
      <Footer locale={locale} />
    </main>
  )
}
