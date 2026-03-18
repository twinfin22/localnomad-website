import { Clock, ArrowRight, LogOut, Globe } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { VisaTransitionPath } from '@/lib/types/visa';
import { NationalityBanner } from './NationalityBanner';

interface TransitionDetailCardProps {
  from: string;
  fromName: string;
  transition: VisaTransitionPath;
  locale: string;
  country: string;
}

export function TransitionDetailCard({
  from,
  fromName,
  transition,
  locale,
  country,
}: TransitionDetailCardProps) {
  const slug = `${from}-to-${transition.type}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Top row: FROM → TO + badge */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold tracking-tight text-[#1B4965]">
            {from.toUpperCase()}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="text-base font-extrabold tracking-tight text-[#1B4965]">
            {transition.type.toUpperCase()}
          </span>
        </div>
        <StatusBadge transition={transition} />
      </div>

      {/* Visa full name */}
      <p className="mb-2 text-sm font-medium text-slate-700">{transition.name}</p>

      {/* Requirements summary */}
      <p className="mb-3 text-[13.5px] leading-relaxed text-slate-500">
        {transition.requirements}
      </p>

      {/* Nationality banner inline */}
      {transition.nationalityDependent && (
        <div className="mb-3">
          <NationalityBanner notes={transition.nationalityNotes ?? undefined} />
        </div>
      )}

      {/* Medium confidence caveat */}
      {transition.confidenceLevel === 'medium' && (
        <p className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Verify this path with your local immigration office — official documentation is limited.
        </p>
      )}

      {/* Meta row: timeline + link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{transition.timeline}</span>
        </div>
        <Link
          href={`/${country}/visa/change/${slug}`}
          className="flex items-center gap-1 text-sm font-semibold text-[#1B4965] hover:underline"
        >
          View full requirements
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ transition }: { transition: VisaTransitionPath }) {
  if (transition.nationalityDependent) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
        <Globe className="h-3 w-3" aria-hidden="true" />
        Nationality-dependent
      </span>
    );
  }
  if (transition.mustExitCountry) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-[#fce8e8] px-2.5 py-0.5 text-[11px] font-semibold text-[#D64045]">
        <LogOut className="h-3 w-3" aria-hidden="true" />
        Must exit Korea
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
      In-country
    </span>
  );
}
