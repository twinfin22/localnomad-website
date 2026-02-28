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
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feat, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="group flex items-start gap-4 text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
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
