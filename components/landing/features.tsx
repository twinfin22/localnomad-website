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
    <section className="bg-neutral-50 px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feat, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="flex flex-col items-center gap-3 text-center">
                <feat.icon className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground">{feat.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
