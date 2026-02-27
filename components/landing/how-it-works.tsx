import { useTranslations } from 'next-intl';
import { Globe, FileSearch, FolderCheck } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';

export const HowItWorks = () => {
  const t = useTranslations('Landing');

  const steps = [
    { icon: Globe, title: t('step1Title'), desc: t('step1Desc') },
    { icon: FileSearch, title: t('step2Title'), desc: t('step2Desc') },
    { icon: FolderCheck, title: t('step3Title'), desc: t('step3Desc') },
  ];

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="font-lora text-3xl font-bold text-primary sm:text-4xl">
            {t('howItWorksTitle')}
          </h2>
        </ScrollReveal>

        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
