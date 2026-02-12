const steps = [
  {
    number: "01",
    title: "Intro Call",
    description: "A focused conversation to understand your goals, timeline, and what you have tried so far."
  },
  {
    number: "02",
    title: "Discovery",
    description: "We assess the market, refine your messaging, and determine whether Korea is the right move now."
  },
  {
    number: "03",
    title: "Entry Sprint or Execution Partner",
    description: "Depending on your needs, we either run an intensive sprint or provide short-term on-the-ground support."
  },
  {
    number: "04",
    title: "Clear Wrap-up",
    description: "We deliver findings, recommendations, and a clear path forward. No open-ended engagements."
  }
]

export function BusinessHowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16 text-balance">
          How It Works
        </h2>

        <div className="space-y-8">
          {steps.map((step) => (
            <div 
              key={step.number}
              className="flex gap-6 items-start"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{step.number}</span>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
