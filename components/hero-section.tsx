"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Stamp, ArrowRight } from "lucide-react";
import { HeroBackground } from "@/components/theme-preview";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden relative">
      {/* Dynamic theme background */}
      <HeroBackground />

      <div className="container mx-auto max-w-5xl text-center relative z-10">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-primary">Your Korea Journey Starts Here</span>
        </div>

        <h1
          className={`text-fluid-hero font-bold mb-6 text-balance px-2 tracking-tight transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          <span className="text-foreground">Your </span>
          <span className="text-primary relative">
            Seoul
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-accent/40"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0 6 Q 25 0, 50 6 T 100 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-foreground"> Toolkit</span>
        </h1>

        <p
          className={`text-fluid-subhero text-muted-foreground mb-14 font-normal px-2 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          Everything you need to live, work, and thrive in Korea.
          <br className="hidden sm:block" />
          <span className="text-foreground/80 font-medium">Curated guides, area insights, and visa support.</span>
        </p>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 px-4 sm:px-0">
          {/* Bundles Card */}
          <Link
            href="/bundles"
            className={`group transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            <div className="relative bg-card p-7 sm:p-8 rounded-2xl border border-border hover:border-primary/40 card-lift shadow-navy hover:shadow-navy-lg h-full card-accent-left overflow-hidden cursor-pointer">
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 mx-auto group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">Info Bundles</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Checklists, playbooks, and cheatsheets for your Korea journey
                </p>
              </div>
            </div>
          </Link>

          {/* Areas Card */}
          <Link
            href="/areas"
            className={`group transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="relative bg-card p-7 sm:p-8 rounded-2xl border border-border hover:border-accent/40 card-lift shadow-navy hover:shadow-coral h-full card-accent-left overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 mx-auto group-hover:bg-accent/15 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">Area Guide</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Neighborhood insights and custom housing reports
                </p>
              </div>
            </div>
          </Link>

          {/* Visa Card */}
          <Link
            href="/visa"
            className={`group transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="relative bg-card p-7 sm:p-8 rounded-2xl border border-border hover:border-accent/40 card-lift shadow-navy hover:shadow-coral h-full card-accent-left overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-5 mx-auto group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <Stamp className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">Visa Dashboard</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Step-by-step guides and checklists for your visa
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div
          className={`mt-12 transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <Link href="/bundles">
            <Button
              size="cta"
              className="group font-semibold btn-gradient-navy text-white border-0 shadow-navy-md hover:shadow-navy-xl transition-all duration-400"
            >
              Explore All Resources
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className={`mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground transition-all duration-700 ease-out ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Updated Weekly</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Local Experts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>500+ Nomads Helped</span>
          </div>
        </div>
      </div>
    </section>
  );
}
