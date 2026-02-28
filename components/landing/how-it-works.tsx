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
    <section className="bg-white px-6 pt-32 pb-28">
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <h2 className="font-lora text-3xl font-bold text-wrap-balance text-primary sm:text-4xl">
            {t('howItWorksTitle')}
          </h2>
          <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-primary/20" />
        </ScrollReveal>

        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <div className="relative flex flex-col items-center gap-4">
                {/* Ghost step number */}
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none font-lora text-[120px] font-bold leading-none text-primary/[0.04]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/5 transition-transform duration-300 hover:scale-110">
                  <step.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-wrap-balance text-foreground">
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
