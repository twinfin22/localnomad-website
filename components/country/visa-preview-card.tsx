import { ArrowRight, Clock, DollarSign } from 'lucide-react';

import { Link } from '@/i18n/navigation';

interface VisaPreviewCardProps {
  type: string;
  shortName: string;
  tagline: string;
  durationInitial: string;
  applicationFee: string;
  keyRequirement: string;
  country: string;
}

export function VisaPreviewCard({
  type,
  shortName,
  tagline,
  durationInitial,
  applicationFee,
  keyRequirement,
  country,
}: VisaPreviewCardProps) {
  const truncatedReq =
    keyRequirement.length > 40
      ? keyRequirement.slice(0, 40) + '…'
      : keyRequirement;

  return (
    <Link
      href={`/${country}/visa/${type}`}
      className="group cursor-pointer block rounded-lg border bg-white p-4 sm:p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-primary text-base leading-snug">
            {shortName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {tagline}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary/40 group-hover:text-primary transition-colors mt-0.5" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {durationInitial}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5 shrink-0" />
          {applicationFee}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-1">
        {truncatedReq}
      </p>
    </Link>
  );
}
