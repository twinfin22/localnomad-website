import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import {
  WhySection,
  ServicesDetailSection,
  ComparisonSection,
  SocialProofSection,
  FaqSection,
  CtaSection,
} from "@/components/sections"
import { Footer } from "@/components/footer"
import { ThemePreviewProvider, ThemePreview } from "@/components/theme-preview"

export default function Page() {
  return (
    <ThemePreviewProvider>
      <main className="min-h-screen overflow-x-hidden">
        <Header />
        <HeroSection />
        <WhySection />
        <ServicesDetailSection />
        <ComparisonSection />
        <SocialProofSection />
        <FaqSection />
        <CtaSection />
        <Footer />
        <ThemePreview />
      </main>
    </ThemePreviewProvider>
  )
}
