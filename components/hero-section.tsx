import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/seoul-hero.png')" }}
      />
      <div className="absolute inset-0 bg-black/50 dark:bg-black/60" />
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h1 className="text-fluid-hero font-bold text-white mb-6 text-balance px-2">
          Soft Landing, Designed for the Borderless
        </h1>

        <p className="text-fluid-subhero text-white/80 mb-12 font-light px-2 max-w-2xl mx-auto">
          A landing hack from arrival to daily life
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-2 max-w-sm sm:max-w-none mx-auto">
          <Button
            variant="ctaPrimary"
            size="cta"
            className="w-full sm:w-auto font-semibold"
          >
            Get a Free Curated List of Local Resources
          </Button>

          <Button
            variant="ctaSecondary"
            size="cta"
            className="w-full sm:w-auto font-medium"
          >
            Stay in-the-know on Network Societies
          </Button>
        </div>
      </div>
    </section>
  )
}
