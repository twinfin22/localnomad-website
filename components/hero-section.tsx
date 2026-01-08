import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 overflow-hidden relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/seoul-hero.png')" }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 text-balance px-2">
          Soft Landing, Designed for the Borderless
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-12 font-light px-2">
          A landing hack from arrival to daily life
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-2 max-w-md sm:max-w-none mx-auto">
          <Button
            size="lg"
            className="
              bg-white text-primary
              hover:bg-primary hover:text-white
              w-full sm:w-auto
              px-6 sm:px-8
              py-5 sm:py-6
              text-center
              flex flex-col
              items-center
              gap-0.5
              shadow-lg hover:shadow-xl
              transition-all duration-200
              font-semibold
            "
          >
            <span className="text-sm sm:text-base font-semibold leading-snug">
              Get a Free Curated List
            </span>
            <span className="text-xs sm:text-sm font-normal opacity-70 leading-snug">
              of Local Resources
            </span>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="
              border border-white/40
              bg-white/10 backdrop-blur-sm
              text-white
              hover:bg-white/20 hover:border-white/60
              w-full sm:w-auto
              px-6 sm:px-8
              py-5 sm:py-6
              text-center
              flex flex-col
              items-center
              gap-0.5
              transition-all duration-200
            "
          >
            <span className="text-sm sm:text-base font-medium leading-snug">
              Stay in-the-know
            </span>
            <span className="text-xs sm:text-sm font-normal opacity-70 leading-snug">
              on Network Societies
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
}
