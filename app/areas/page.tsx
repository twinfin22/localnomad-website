import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SeoulNeighborhoodMap } from "@/components/SeoulNeighborhoodMap"
import { MapPin, FileSearch, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AreasPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />

      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 mx-auto">
              <MapPin className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Area Guide</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore Seoul neighborhoods and find your perfect home base
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <SeoulNeighborhoodMap />

      {/* Custom Report CTA */}
      <section className="py-20 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
              <FileSearch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Need a Custom Housing Report?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Tell us your requirements and we&apos;ll research the best options for you.
              Get a personalized report delivered within 48 hours.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <Clock className="w-4 h-4" />
              <span>48-hour turnaround</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <a
                  href="https://tally.so"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Request Custom Report
                </a>
              </Button>
              <div className="text-sm text-muted-foreground self-center">
                Starting at <span className="font-semibold text-foreground">$99</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
