import { AlertTriangle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface NationalityBannerProps {
  notes?: string;
}

export async function NationalityBanner({ notes }: NationalityBannerProps) {
  const t = await getTranslations('VisaChange');

  return (
    <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <div>
        <p className="font-semibold">{t('nationalityTitle')}</p>
        <p className="mt-0.5 text-amber-700">
          {notes ?? t('nationalityDefault')}
        </p>
      </div>
    </div>
  );
}
