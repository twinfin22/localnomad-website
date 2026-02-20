import { redirect } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getActiveVisa, getChecklist } from '@/lib/actions/dashboard';
import { getVisaData } from '@/lib/visa-data';
import { DashboardHeader, DDayCountdown, ChecklistCard } from '@/components/dashboard';
import type { Country } from '@/lib/types/visa';

const COUNTRY_CODE_TO_SLUG: Record<string, Country> = {
  kr: 'korea',
  tw: 'taiwan',
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const activeVisa = await getActiveVisa();
  if (!activeVisa) {
    redirect(`/${locale}/onboarding`);
  }

  const t = await getTranslations('Dashboard');

  const countrySlug = COUNTRY_CODE_TO_SLUG[activeVisa.country] ?? 'korea';
  const visa = await getVisaData(countrySlug, locale, activeVisa.visa_type);
  const checklist = await getChecklist(activeVisa.id);

  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <DashboardHeader
          visaName={visa?.name ?? activeVisa.visa_type.toUpperCase()}
          country={activeVisa.country}
        />

        <div className="mt-8">
          <DDayCountdown expiryDate={activeVisa.expiry_date} />
        </div>

        {visa && (
          <div className="mt-8">
            <ChecklistCard
              documents={visa.documents}
              userVisaId={activeVisa.id}
              initialChecklist={checklist}
            />
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={`/${countrySlug}/visa/${activeVisa.visa_type}`}
            className="inline-flex min-h-[44px] items-center text-sm text-primary hover:underline"
          >
            {t('viewGuide')} &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
