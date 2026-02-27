import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { AuthNav } from '@/components/auth';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Footer } from '@/components/footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
    <>
      {/* Set lang attribute on root <html> — runs before hydration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${locale}"`,
        }}
      />
      <NextIntlClientProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t('skipToContent')}
        </a>
        <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-lg">
          <nav aria-label={t('mainNavigation')} className="mx-auto flex items-center justify-between gap-4 px-6 py-3 text-sm">
            <Link href="/" className="font-lora text-xl font-bold text-primary transition-opacity hover:opacity-80">
              LocalNomad
            </Link>
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <AuthNav />
            </div>
          </nav>
        </header>
        {children}
        <Footer />
      </NextIntlClientProvider>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </>
  );
}
