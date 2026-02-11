import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';

interface VisaHeroProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function VisaHero({
  headline = "Not sure which visa you need?",
  subheadline = "Answer 5 questions. Get your personalized visa path in 2 minutes.",
  ctaText = "Find My Visa",
  ctaHref = "/visa/find",
  secondaryCtaText = "Browse All Visas",
  secondaryCtaHref = "#visa-grid",
}: VisaHeroProps) {
  return (
    <section className="min-h-[70vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden bg-[#0B1120]">
      {/* Background gradient - more subtle and visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120]" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/3 to-transparent rounded-full" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto max-w-4xl relative z-10">
        <AnimatedSection>
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-heading text-white leading-tight">
              {headline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-8 py-6 text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {ctaText}
                </Button>
              </Link>
              <Link href={secondaryCtaHref}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 px-8 py-6 text-lg"
                >
                  {secondaryCtaText}
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Free to use
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                No account required
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Updated regularly
              </span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
