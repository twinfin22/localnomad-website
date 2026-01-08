import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ValuePropSection } from "@/components/value-prop-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { SeoulNeighborhoodMap } from "@/components/SeoulNeighborhoodMap"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { WhatsNextSection } from "@/components/whats-next-section"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <HeroSection />
      <ValuePropSection />
      <SocialProofSection />
      <SeoulNeighborhoodMap />
      <PricingSection />
      <FaqSection />
      <WhatsNextSection />
      <Footer />
    </main>
  )
}
