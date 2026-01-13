import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

export function BusinessServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16 text-balance">
          Three Ways to Work With Us
        </h2>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="p-6 sm:p-8 bg-card shadow-sm flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">First Step</span>
            </div>
            <h3 className="text-fluid-subsection font-bold text-foreground mb-4">Discovery</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              A focused assessment to determine if Korea makes sense for you right now.
            </p>
            <ul className="space-y-3 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Market reality check</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Messaging gap analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Go / No-Go clarity</span>
              </li>
            </ul>
            <div className="mt-8">
              <Button variant="ctaPrimary" size="cta" className="w-full" asChild>
                <a href="mailto:hello@localnomad.club?subject=Discovery%20Inquiry">
                  Start Discovery
                </a>
              </Button>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-primary text-primary-foreground shadow-lg border-primary flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Core Offer</span>
            </div>
            <h3 className="text-fluid-subsection font-bold mb-2">Entry Sprint</h3>
            <p className="opacity-80 mb-2 text-sm">2-4 weeks</p>
            <p className="opacity-90 mb-6 text-sm sm:text-base">
              Intensive on-the-ground representation to test your positioning with real audiences.
            </p>
            <ul className="space-y-3 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">Representing your team at events or sessions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">Public speaking and facilitated discussions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">Hosting or co-hosting focused events</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">Collecting real audience reactions</span>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t border-primary-foreground/20">
              <p className="text-xs opacity-70 mb-4">Deliverables: Summary of reactions, objections and signals, strategic recommendations</p>
            </div>
            <div className="mt-auto">
              <Button variant="inverted" size="cta" className="w-full" asChild>
                <a href="mailto:hello@localnomad.club?subject=Entry%20Sprint%20Inquiry">
                  Discuss Entry Sprint
                </a>
              </Button>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-card shadow-sm flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">Extension</span>
            </div>
            <h3 className="text-fluid-subsection font-bold text-foreground mb-4">Execution Partner</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Short-term, scoped on-the-ground representation after your Entry Sprint.
            </p>
            <ul className="space-y-3 flex-1">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Temporary local representation</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Meetings, events, coordination</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Clear scope and timeline</span>
              </li>
            </ul>
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground">Not a long-term agency. Not outsourcing. Defined scope only.</p>
            </div>
            <div className="mt-8">
              <Button variant="ctaSecondary" size="cta" className="w-full" asChild>
                <a href="mailto:hello@localnomad.club?subject=Execution%20Partner%20Inquiry">
                  Learn More
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
