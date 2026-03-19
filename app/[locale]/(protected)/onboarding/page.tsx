import { redirect } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getActiveVisa } from '@/lib/actions/dashboard';
import { OnboardingForm } from '@/components/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // If user already has an active visa, skip onboarding
  const activeVisa = await getActiveVisa();
  if (activeVisa) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations('Onboarding');

  return (
    <main id="main-content" className="flex min-h-svh items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-lora text-3xl sm:text-4xl font-bold text-primary">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="mt-8">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
