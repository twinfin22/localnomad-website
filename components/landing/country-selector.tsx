import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from './scroll-reveal';

interface DestinationCardProps {
  href: string;
  name: string;
  hook: string;
  visaCount: string;
  imageSrc: string;
  delay: number;
}

const DestinationCard = ({ href, name, hook, visaCount, imageSrc, delay }: DestinationCardProps) => (
  <ScrollReveal delay={delay}>
    <Link
      href={href}
      className="group relative flex h-[340px] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 sm:h-[400px]"
    >
      {/* Background image */}
      <Image
        src={imageSrc}
        alt={name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5 transition-opacity duration-300 group-hover:from-black/60 group-hover:via-black/20" />

      {/* Content */}
      <div className="relative z-[1] p-5 sm:p-6">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
          {visaCount}
        </span>
        <h3
          className="mt-3 font-lora text-2xl font-bold text-white sm:text-3xl"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {name}
        </h3>
        <p
          className="mt-1.5 text-sm leading-relaxed text-white/80 sm:text-base"
          style={{
            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          {hook}
        </p>

        {/* Hover arrow indicator */}
        <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-white/70 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
          <span>{name}</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  </ScrollReveal>
);

export const CountrySelector = async () => {
  const t = await getTranslations('Landing');

  const destinations = [
    {
      href: '/japan',
      name: t('countryJapan'),
      hook: t('countryJapanHook'),
      visaCount: t('countryJapanVisaCount'),
      imageSrc: '/images/visa/japan-visa-bg.jpg',
    },
    {
      href: '/korea',
      name: t('countryKorea'),
      hook: t('countryKoreaHook'),
      visaCount: t('countryKoreaVisaCount'),
      imageSrc: '/images/checklist/korea-checklist-bg.jpg',
    },
    {
      href: '/taiwan',
      name: t('countryTaiwan'),
      hook: t('countryTaiwanHook'),
      visaCount: t('countryTaiwanVisaCount'),
      imageSrc: '/images/visa/taiwan-visa-bg.jpg',
    },
    {
      href: '/southeast-asia',
      name: t('countrySEA'),
      hook: t('countrySEAHook'),
      visaCount: t('countrySEAVisaCount'),
      imageSrc: '/images/sea-hero-bg.jpg',
    },
  ];

  return (
    <section className="bg-neutral-50 px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="mb-10 text-center">
            <h2 className="font-lora text-3xl font-bold text-primary sm:text-4xl">
              {t('countrySectionTitle')}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t('countrySectionSubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((dest, i) => (
            <DestinationCard
              key={dest.href}
              href={dest.href}
              name={dest.name}
              hook={dest.hook}
              visaCount={dest.visaCount}
              imageSrc={dest.imageSrc}
              delay={i * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
