import { FileX, MessageSquareOff, MapPinOff, Users } from "lucide-react"

const problems = [
  {
    icon: FileX,
    title: "Decks without speakers",
    description: "Your materials arrive, but no one is there to present them with conviction or answer the real questions."
  },
  {
    icon: MessageSquareOff,
    title: "Research without real-world answers",
    description: "Market reports tell you what happened. They rarely tell you what to do next or how people will actually respond."
  },
  {
    icon: MapPinOff,
    title: "Meetings without local context",
    description: "Introductions happen, but without someone who understands both sides, conversations stall or miss the point."
  },
  {
    icon: Users,
    title: "Events without proper representation",
    description: "You sponsor or attend, but there is no one on the ground to speak for you, listen carefully, or follow up."
  }
]

export function BusinessProblemSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-6 text-balance">
          Entering Korea fails when no one can explain you properly.
        </h2>
        <p className="text-center text-muted-foreground mb-12 sm:mb-16 max-w-2xl mx-auto">
          Most market entry efforts lose momentum not because of the product, but because of how it is introduced.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {problems.map((problem) => (
            <div 
              key={problem.title}
              className="bg-card p-6 sm:p-8 rounded-lg border shadow-sm"
            >
              <problem.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
