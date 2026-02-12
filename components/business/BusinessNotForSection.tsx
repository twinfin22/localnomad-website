import { X } from "lucide-react"

const exclusions = [
  {
    title: "Legal or accounting services",
    description: "We do not provide legal, tax, or compliance advice. Work with licensed professionals for those needs."
  },
  {
    title: "Guaranteed outcomes",
    description: "We provide clarity and execution, not promises. Market entry depends on many factors beyond representation."
  },
  {
    title: "Long-term outsourced operations",
    description: "We are not a substitute for building your own team. Our engagements are scoped, temporary, and designed to help you decide your next step."
  }
]

export function BusinessNotForSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-6 text-balance">
          Who This Is Not For
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          To ensure we are the right fit, here is what we do not offer.
        </p>

        <div className="space-y-6">
          {exclusions.map((item) => (
            <div 
              key={item.title}
              className="flex gap-4 items-start bg-card p-6 rounded-lg border"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
