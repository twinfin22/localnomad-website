import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PlanDashboard, type PlanCountryData } from '@/components/plan/plan-dashboard';
import { getChecklistData } from '@/lib/checklist-data';
import { getNeighborhoodData } from '@/lib/neighborhood-data';
import { getAvailableVisas } from '@/lib/visa-data';
import { routing } from '@/i18n/routing';
import type { Country } from '@/lib/types/visa';

const COUNTRIES = ['korea', 'japan', 'taiwan'] as const;
const COUNTRY_NAMES: Record<(typeof COUNTRIES)[number], string> = {
  korea: 'South Korea',
  japan: 'Japan',
  taiwan: 'Taiwan',
};

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Your plan | LocalNomad',
  description: 'Keep your visa, neighborhood, and arrival preparation in one place.',
  robots: { index: false, follow: false },
};

export default async function PlanPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale) || locale !== 'en') notFound();
  setRequestLocale(locale);

  const countries = await Promise.all(COUNTRIES.map(async (country): Promise<PlanCountryData> => {
    const [visas, neighborhoods, checklist] = await Promise.all([
      getAvailableVisas(country as Country, 'en'),
      getNeighborhoodData(country),
      getChecklistData(country, 'en'),
    ]);

    return {
      id: country,
      name: COUNTRY_NAMES[country],
      visas: visas.map((visa) => ({
        id: visa.type,
        label: visa.shortName || visa.name,
        href: `/en/${country}/visa/${visa.type}`,
      })),
      neighborhoods: neighborhoods?.cities.flatMap((city) => city.neighborhoods.map((neighborhood) => ({
        id: `${country}:${city.name}:${neighborhood.name}`,
        label: `${neighborhood.name}, ${city.name}`,
        href: `/en/neighborhood/${country}`,
      }))) ?? [],
      checklist: checklist?.phases.flatMap((phase) => phase.items.map((item) => ({
        id: item.id,
        label: item.label,
        required: item.required,
      }))) ?? [],
    };
  }));

  return (
    <main id="main-content" className="min-h-svh bg-neutral-50">
      <PlanDashboard countries={countries} />
    </main>
  );
}
