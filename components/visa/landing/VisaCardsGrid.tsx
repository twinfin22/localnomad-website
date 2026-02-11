'use client';

import { VisaCard } from '@/components/visa/VisaCard';
import { AnimatedSection } from '@/components/animated-section';
import type { VisaInfo } from '@/lib/visa/types';

interface VisaCardsGridProps {
  visas: VisaInfo[];
  title?: string;
  subtitle?: string;
}

export function VisaCardsGrid({
  visas,
  title = "Explore Visa Types",
  subtitle = "Select a visa to view detailed requirements and guides",
}: VisaCardsGridProps) {
  return (
    <section id="visa-grid" className="py-16 px-4 sm:px-6 bg-[#0B1120]">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
              {title}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visas.map((visa, index) => (
            <AnimatedSection key={visa.type} delay={index * 0.1}>
              <VisaCard visa={visa} darkMode />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
