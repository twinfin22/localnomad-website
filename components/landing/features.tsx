import { useTranslations } from 'next-intl';
import { ClipboardList, CheckSquare, Users } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

export const Features = () => {
  const t = useTranslations('Landing');

  const features = [
    { icon: ClipboardList, title: t('feat1Title'), desc: t('feat1Desc') },
    { icon: CheckSquare, title: t('feat2Title'), desc: t('feat2Desc') },
    { icon: Users, title: t('feat3Title'), desc: t('feat3Desc') },
  ];

  return (
    <section className="bg-neutral-50 px-6 pt-16 pb-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="sr-only">{t('featuresHeading')}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feat, i) => (
            <ScrollReveal key={i} delay={i * 150} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className="group flex h-full flex-col items-start gap-4 rounded-xl border border-border/60 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
                  <feat.icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-light" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-wrap-balance text-foreground">
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">{feat.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
