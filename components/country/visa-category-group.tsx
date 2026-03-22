import type { LucideIcon } from 'lucide-react';

import { VisaPreviewCard } from './visa-preview-card';

interface VisaCategoryGroupProps {
  label: string;
  icon: LucideIcon;
  visas: Array<{
    type: string;
    shortName: string;
    tagline: string;
    durationInitial: string;
    applicationFee: string;
    keyRequirement: string;
  }>;
  country: string;
}

export function VisaCategoryGroup({
  label,
  icon: Icon,
  visas,
  country,
}: VisaCategoryGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground text-lg">{label}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visas.map((visa) => (
          <VisaPreviewCard key={visa.type} {...visa} country={country} />
        ))}
      </div>
    </div>
  );
}
