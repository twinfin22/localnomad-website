"use client"

import { Card } from "@/components/ui/card"
import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    author: "Founder",
  },
]

export function SocialProofSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: false,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev()
      if (e.key === "ArrowRight") scrollNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [scrollPrev, scrollNext])

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-fluid-section font-bold text-center text-foreground mb-8 sm:mb-12 text-balance">
          From Fellow Nomads
        </h2>
        
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6 select-none">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0"
                >
                  <Card className="h-full p-6 sm:p-8 bg-card border shadow-sm">
                    <p className="text-base sm:text-lg text-foreground mb-4 italic text-pretty">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-sm text-muted-foreground">— {testimonial.author}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-10 h-10 items-center justify-center rounded-full bg-background border border-border shadow-md text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors active:scale-95"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-10 h-10 items-center justify-center rounded-full bg-background border border-border shadow-md text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors active:scale-95"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
