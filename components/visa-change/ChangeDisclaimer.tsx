import { Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface ChangeDisclaimerProps {
  position: 'above' | 'below';
}

export async function ChangeDisclaimer({ position }: ChangeDisclaimerProps) {
  const t = await getTranslations('VisaChange');

  if (position === 'above') {
    return (
      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-100 p-3 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <p>{t('disclaimerAbove')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 text-xs leading-relaxed text-slate-400">
      <p>{t('disclaimerBelow')}</p>
    </div>
  );
}
