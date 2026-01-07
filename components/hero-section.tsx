import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 overflow-hidden">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance px-2">
          Soft Landing, Designed for the Borderless
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 font-light px-2">
          A landing hack from arrival to daily life
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center px-2">
          {/* Primary CTA */}
          <Button
            size="lg"
            className="
              bg-primary
              text-primary-foreground
              w-full sm:w-auto
              px-8
              py-6
              text-center
              flex flex-col
              items-center
              gap-1
            "
          >
            <span className="text-sm sm:text-base font-medium leading-snug">
              Get a Free Curated List
            </span>
            <span className="text-xs sm:text-sm opacity-90 leading-snug">
              of Local Resources
            </span>
          </Button>

          {/* Secondary CTA */}
          <Button
            size="lg"
            variant="outline"
            className="
              border-2
              bg-transparent
              w-full sm:w-auto
              px-8
              py-6
              text-center
              flex flex-col
              items-center
              gap-1
            "
          >
            <span className="text-sm sm:text-base font-medium leading-snug">
              Stay in-the-know
            </span>
            <span className="text-xs sm:text-sm opacity-80 leading-snug">
              on Network Societies
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
}
