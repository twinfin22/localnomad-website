import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function ConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { email } = await searchParams;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Auth');

  return (
    <main id="main-content" className="flex min-h-svh items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          ✉️
        </div>
        <h1 className="mt-6 font-lora text-2xl font-bold text-primary">
          {t('checkEmail')}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('confirmMessage', { email: email || '' })}
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex min-h-[44px] items-center text-sm text-primary hover:underline"
        >
          &larr; {t('backToLogin')}
        </Link>
      </div>
    </main>
  );
}
