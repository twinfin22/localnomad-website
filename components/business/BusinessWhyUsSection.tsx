import { MessageCircle, Mic, TrendingUp } from "lucide-react"

const pillars = [
  {
    icon: MessageCircle,
    title: "We clarify your story",
    description: "Before you speak to the market, we help you understand what actually resonates here — and what does not. We refine your messaging so it lands with the right people."
  },
  {
    icon: Mic,
    title: "We speak on your behalf",
    description: "At events, in meetings, or in focused sessions, we represent your team with clarity and credibility. We are not observers — we are your voice on the ground."
  },
  {
    icon: TrendingUp,
    title: "We turn reactions into strategy",
    description: "We capture what people say, what they hesitate about, and what excites them. Then we translate that into clear recommendations for your next move."
  }
]

export function BusinessWhyUsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-12 sm:mb-16 text-balance">
          What We Actually Do
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div 
              key={pillar.title}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <pillar.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
