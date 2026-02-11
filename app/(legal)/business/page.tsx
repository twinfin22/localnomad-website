import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  BusinessHeroSection,
  BusinessProblemSection,
  BusinessWhyUsSection,
  BusinessServicesSection,
  BusinessHowItWorksSection,
  BusinessNotForSection,
  BusinessCtaSection
} from "@/components/business"

export default function BusinessPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <BusinessHeroSection />
      <BusinessProblemSection />
      <BusinessWhyUsSection />
      <BusinessServicesSection />
      <BusinessHowItWorksSection />
      <BusinessNotForSection />
      <BusinessCtaSection />
      <Footer />
    </main>
  )
}
