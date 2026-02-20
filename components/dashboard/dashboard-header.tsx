import { getTranslations } from 'next-intl/server';

interface DashboardHeaderProps {
  visaName: string;
  country: string;
}

export async function DashboardHeader({
  visaName,
  country,
}: DashboardHeaderProps) {
  const t = await getTranslations('Dashboard');
  const displayCountry = country === 'kr' ? 'South Korea' : 'Taiwan';

  return (
    <div>
      <h1 className="font-lora text-3xl font-bold text-primary">
        {t('title')}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {visaName} · {displayCountry}
      </p>
    </div>
  );
}
