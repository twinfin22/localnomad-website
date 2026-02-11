import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';

interface UndecidedCTAProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function UndecidedCTA({
  title = "Still not sure?",
  subtitle = "Korean visa paths can be confusing. Let us help you figure out the best option for your situation.",
  ctaText = "Take the Quiz",
  ctaHref = "/visa/find",
}: UndecidedCTAProps) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#0F172A]">
      <div className="container mx-auto max-w-4xl">
        <AnimatedSection>
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-3xl p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 mx-auto">
              <HelpCircle className="w-8 h-8 text-cyan-400" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {title}
            </h3>

            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              {subtitle}
            </p>

            <Link href={ctaHref}>
              <Button
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-8 py-6 text-lg"
              >
                {ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
