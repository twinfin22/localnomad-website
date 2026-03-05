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
            <a
              href="https://discord.gg/uc2eNKVF3V"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex rounded-full p-2 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Discord"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>
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
