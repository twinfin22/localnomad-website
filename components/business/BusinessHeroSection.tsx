import { Button } from "@/components/ui/button"

export function BusinessHeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 overflow-hidden relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/seoul-hero.png')" }}
      />
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h1 className="text-fluid-hero font-bold text-white mb-6 text-balance px-2">
          Korea Market Entry, Explained and Represented on the Ground.
        </h1>

        <p className="text-fluid-subhero text-white/80 mb-12 font-light px-2 max-w-3xl mx-auto">
          We help global teams explore, test, and enter Korea — by thinking clearly, speaking publicly, and executing locally.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0 max-w-lg mx-auto">
          <Button
            variant="ctaPrimary"
            size="cta"
            className="font-semibold"
            asChild
          >
            <a href="mailto:hello@localnomad.club?subject=Discovery%20Call%20Request">
              Start with Discovery
            </a>
          </Button>
          <Button
            variant="ctaOutline"
            size="cta"
            className="font-semibold"
            asChild
          >
            <a href="#how-it-works">
              See How We Work
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
