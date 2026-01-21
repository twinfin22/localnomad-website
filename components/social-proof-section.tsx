"use client";

import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { cn } from "@/lib/utils";

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
];

export function SocialProofSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[#120826]" />
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatedSection>
          <h2 className="text-fluid-section font-bold text-center text-white mb-8 sm:mb-12 text-balance">
            From Fellow <span className="text-gradient">Nomads</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 sm:gap-6 select-none">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0"
                  >
                    <Card className="h-full p-6 sm:p-8 glass-card hover:border-glow-purple transition-all duration-300">
                      <p className="text-base sm:text-lg text-white/90 mb-4 italic text-pretty">
                        "{testimonial.quote}"
                      </p>
                      <p className="text-sm text-[#00F5D4]">— {testimonial.author}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollPrev}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-10 h-10 items-center justify-center rounded-full glass border-[#8338EC]/50 text-white hover:border-[#FF006E] hover:glow-magenta-sm focus-visible:ring-2 focus-visible:ring-[#FF006E]/50 transition-all duration-200 active:scale-95"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={scrollNext}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-10 h-10 items-center justify-center rounded-full glass border-[#8338EC]/50 text-white hover:border-[#FF006E] hover:glow-magenta-sm focus-visible:ring-2 focus-visible:ring-[#FF006E]/50 transition-all duration-200 active:scale-95"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile dot indicators */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "bg-[#FF006E] w-6 glow-magenta-sm"
                    : "bg-[#8338EC]/50 w-2 hover:bg-[#8338EC]"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
