import { Button } from "@/components/ui/button"

export function BusinessCtaSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/whats-next-bg.png')" }}
      />
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
      <div className="container mx-auto max-w-3xl relative z-10 text-center">
        <h2 className="text-fluid-section font-bold text-white mb-6 text-balance">
          If Korea is on your roadmap, let us start with a clear conversation.
        </h2>
        <p className="text-white/80 mb-10 text-lg">
          No pitch, no pressure. Just an honest assessment of whether we can help.
        </p>
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
      </div>
    </section>
  )
}
