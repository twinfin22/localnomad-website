import { getTranslations } from 'next-intl/server';
import { ScrollReveal } from './scroll-reveal';

interface Testimonial {
  quote: string;
  name: string;
  context: string;
}

export const Testimonials = async () => {
  const t = await getTranslations('Landing');

  const testimonials: Testimonial[] = [
    {
      quote: t('testimonial1Quote'),
      name: t('testimonial1Name'),
      context: t('testimonial1Context'),
    },
    {
      quote: t('testimonial2Quote'),
      name: t('testimonial2Name'),
      context: t('testimonial2Context'),
    },
    {
      quote: t('testimonial3Quote'),
      name: t('testimonial3Name'),
      context: t('testimonial3Context'),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
              {t('testimonialBadge')}
            </span>
            <h2 className="mt-4 font-lora text-3xl font-bold text-primary sm:text-4xl">
              {t('testimonialTitle')}
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map((item, i) => {
            const initials = item.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const isCenter = i === 1;
            return (
              <ScrollReveal key={i} delay={i * 150}>
                <blockquote
                  className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-neutral-50 p-6 shadow-sm transition-all duration-300 ${
                    isCenter
                      ? 'border-primary/30 sm:scale-[1.02]'
                      : 'border-border/60'
                  }`}
                >
                  {/* Oversized decorative quote mark */}
                  <span
                    className="pointer-events-none absolute -top-2 -left-1 select-none font-lora text-[5rem] leading-none text-primary/[0.06]"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="relative flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-3 border-t border-border/40 pt-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                      {initials}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {item.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.context}
                      </span>
                    </div>
                  </footer>
                </blockquote>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
