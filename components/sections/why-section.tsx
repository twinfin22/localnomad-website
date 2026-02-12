"use client";

import { Shield, Clock, MapPin } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const values = [
  {
    icon: Shield,
    title: "Verified Information",
    description:
      "No more outdated blog posts or AI hallucinations. Every guide is personally researched and regularly updated by locals who actually live here.",
    accent: "primary",
  },
  {
    icon: MapPin,
    title: "Local Experience",
    description:
      "Built by someone who navigated Korea as a foreigner. We know the pain points because we've lived them.",
    accent: "accent",
  },
  {
    icon: Clock,
    title: "Save Significant Time",
    description:
      "Skip the endless research rabbit holes. Get straight to the answers with our curated, actionable guides.",
    accent: "primary",
  },
];

export function WhySection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-secondary relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dots-navy opacity-50" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-accent uppercase tracking-widest mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why <span className="text-primary">LocalNomad</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve done the hard work so you don&apos;t have to
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <AnimatedSection key={index}>
              <div className="group text-center p-6 rounded-2xl transition-all duration-300 hover:bg-card hover:shadow-navy-md cursor-default">
                <div className={`w-16 h-16 rounded-2xl ${value.accent === "accent" ? "bg-accent/10 group-hover:bg-accent/15" : "bg-primary/10 group-hover:bg-primary/15"} flex items-center justify-center mb-6 mx-auto transition-all duration-300 group-hover:scale-110`}>
                  <value.icon className={`w-8 h-8 ${value.accent === "accent" ? "text-accent" : "text-primary"}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
