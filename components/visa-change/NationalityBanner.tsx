import { AlertTriangle } from 'lucide-react';

interface NationalityBannerProps {
  notes?: string;
}

export function NationalityBanner({ notes }: NationalityBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <div>
        <p className="font-semibold">Nationality-dependent path</p>
        <p className="mt-0.5 text-amber-700">
          {notes ??
            'Availability and conditions for this path may vary depending on your passport. Check the source link for country-specific details.'}
        </p>
      </div>
    </div>
  );
}
