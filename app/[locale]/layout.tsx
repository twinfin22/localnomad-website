import Image from 'next/image';
import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { AuthNav } from '@/components/auth';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { CountryDropdown, MobileMenu } from '@/components/nav';
import { Footer } from '@/components/footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    openGraph: {
      siteName: 'LocalNomad',
      type: 'website',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-default.png'],
    },
    other: { 'theme-color': '#1B4965' },
  };
}

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations('Nav');

  return (
    <NextIntlClientProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t('skipToContent')}
      </a>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-lg">
        <nav aria-label={t('mainNavigation')} className="mx-auto flex items-center justify-between gap-4 px-6 py-3 text-sm">
          <div className="flex items-center gap-6">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/logo_new_all-blue.png"
                alt="LocalNomad"
                width={140}
                height={20}
                priority
                unoptimized
              />
            </Link>
            <CountryDropdown />
            <Link href="/blog" className="hidden md:inline-flex font-medium text-foreground/80 transition-colors hover:text-foreground">
              {t('blog')}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher />
            <span className="hidden md:inline-flex"><AuthNav /></span>
            <MobileMenu />
          </div>
        </nav>
      </header>
      {children}
      <Footer />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </NextIntlClientProvider>
  );
}
