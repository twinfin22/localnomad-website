import { Button } from "@/components/ui/button"

export function WhatsNextSection() {
  return (
    <section id="popup-residency" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16 text-balance">
          What's Next
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 sm:py-8 text-base sm:text-lg border-2 bg-transparent"
          >
            Need Boots on the ground?
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-6 sm:py-8 text-base sm:text-lg border-2 bg-transparent"
          >
            Join our Popup Residency
          </Button>
          <Button id="newsletter" size="lg" variant="default" className="h-auto py-6 sm:py-8 text-base sm:text-lg">
            Stay in-the-know on Network Societies
          </Button>
        </div>
      </div>
    </section>
  )
}
