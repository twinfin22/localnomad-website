import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LoginForm } from '@/components/auth';
import { getAlternates, DEFAULT_OG_IMAGE } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const alternates = getAlternates(locale, '/login');

  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
    robots: { index: false },
    alternates,
    openGraph: {
      title: t('loginTitle'),
      description: t('loginDescription'),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('loginTitle'),
      description: t('loginDescription'),
      images: ['/og-default.png'],
    },
  };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Auth');

  return (
    <main id="main-content" className="flex min-h-svh items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-lora text-3xl sm:text-4xl font-bold text-primary">
            LocalNomad
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('loginSubtitle')}
          </p>
        </div>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
