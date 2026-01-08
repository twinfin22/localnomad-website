"use client"

import { Card } from "@/components/ui/card"
import { useRef } from "react"

const testimonials = [
  {
    quote: "I stopped stressing about the basics and focused on my work.",
    author: "Digital Nomad",
  },
  {
    quote: "The area orientation guide saved me hours of research and confusion.",
    author: "Remote Worker",
  },
  {
    quote: "Having a local present made all the difference when dealing with paperwork.",
    author: "Slowmad",
  },
  {
    quote: "Finally, a service that understands what nomads actually need.",
    author: "Tech Professional",
  },
]

export function SocialProofSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-8 sm:mb-12 text-balance">
          From Fellow Nomads
        </h2>
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex-shrink-0 w-72 sm:w-80 p-6 sm:p-8 snap-center bg-card border shadow-sm">
              <p className="text-base sm:text-lg text-foreground mb-4 italic text-pretty">"{testimonial.quote}"</p>
              <p className="text-sm text-muted-foreground">— {testimonial.author}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
