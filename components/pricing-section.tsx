import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

export function PricingSection() {
  return (
    <section id="boots-on-ground" className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16 text-balance">
          Choose Your Landing
        </h2>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="p-6 sm:p-8 bg-card shadow-sm">
            <h3 className="text-fluid-subsection font-bold text-foreground mb-2">72 hours</h3>
            <div className="mb-6">
              <span className="text-fluid-price font-bold text-primary">$150</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Pre-arrival cheat sheet & checklist</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Living playbook for landing in Korea</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  1:1 onboarding call (includes unlimited Q&A on the playbook)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  Area orientation guide (shared after neighborhood decision)
                </span>
              </li>
            </ul>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-accent">Get Started</Button>
          </Card>

          <Card className="p-6 sm:p-8 bg-primary text-primary-foreground shadow-lg border-primary">
            <h3 className="text-fluid-subsection font-bold mb-2">14 days</h3>
            <div className="mb-6">
              <span className="text-fluid-price font-bold">$350</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">Everything in 72 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">Guided temporary accommodation setup</span>
              </li>
              <li className="flex items-start gap-3 pl-8">
                <span className="text-xs sm:text-sm opacity-80">• Hotel / coliving / serviced apartment options</span>
              </li>
              <li className="flex items-start gap-3 pl-8">
                <span className="text-xs sm:text-sm opacity-80">• Help prepare required paperwork</span>
              </li>
              <li className="flex items-start gap-3 pl-8">
                <span className="text-xs sm:text-sm opacity-80">• Check-in support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base opacity-90">1:1 check-in call</span>
              </li>
            </ul>
            <Button className="w-full bg-background text-foreground hover:bg-secondary">Get Started</Button>
          </Card>

          <Card className="p-6 sm:p-8 bg-card shadow-sm">
            <h3 className="text-fluid-subsection font-bold text-foreground mb-2">Custom Add-on</h3>
            <div className="mb-6">
              <span className="text-fluid-price font-bold text-primary">$150</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">
                  In-person accompaniment (bank, government offices, hospital, etc.)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Airport pickup & drop-off</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-muted-foreground">Open to suggestions</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full border-2 bg-transparent">
              Contact Us
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}
