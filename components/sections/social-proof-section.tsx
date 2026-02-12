"use client";

import { Star, Quote } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const testimonials = [
  {
    name: "E-7 visa holder, 2024",
    role: "UX Designer, Remote",
    content:
      "The neighborhood guide saved me weeks of research. I found my perfect spot in Yeonnam-dong within days of arriving.",
    rating: 5,
  },
  {
    name: "D-2 student, Seoul",
    role: "Software Engineer",
    content:
      "The visa dashboard was a lifesaver. Step-by-step checklists made the D-10 application process so much less stressful.",
    rating: 5,
  },
  {
    name: "Digital nomad, Yeonnam-dong",
    role: "Content Creator",
    content:
      "Finally, accurate information about Korea! No more conflicting blog posts from 2019. Everything was up-to-date and actionable.",
    rating: 5,
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-secondary relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by Nomads & Expats
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from people who made the move
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <AnimatedSection key={testimonial.name}>
              <div className="group bg-card border border-border rounded-2xl p-6 lg:p-8 h-full flex flex-col card-lift shadow-navy hover:shadow-navy-lg transition-all duration-300">
                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>

                <div className="relative flex-1 mb-6">
                  <Quote className="w-10 h-10 text-primary/10 absolute -top-2 -left-2" />
                  <p className="text-foreground/80 relative z-10 pl-4 leading-relaxed italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>

                <div className="border-t border-border pt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
