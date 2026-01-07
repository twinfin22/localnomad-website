import { CheckCircle2 } from "lucide-react"

export function ValuePropSection() {
  return (
    <section id="soft-landing" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance px-2">
            Remove friction from your first 14 days in Seoul.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground font-light px-2">Focus on living, not logistics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          <div className="space-y-4">
            <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground text-pretty">
              Stop "Paying Attention" just to get "free" information
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>No more fragmented "Complete Guides"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>Continuously updated, human-verified context</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 md:border-x border-border md:px-6">
            <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-foreground text-pretty">
              Stop debugging local processes.
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>With a local present, routine processes become simple</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>
                  From real estate agents to public offices, a local presence keeps interactions clear and efficient
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground text-pretty">
              Avoid the usual early-stage friction
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>Area orientation guide to keep your first 72 hours smooth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>We guarantee completeness through unlimited Q&A during your onboarding call</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
