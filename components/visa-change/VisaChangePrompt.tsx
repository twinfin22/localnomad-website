import { Link } from '@/i18n/navigation';
import { getTransitionsFrom } from '@/lib/visa-transitions';
import type { Country } from '@/lib/types/visa';
import { ArrowRight } from 'lucide-react';

interface Props {
  country: string;
  visaType: string;
  locale?: string;
}

export async function VisaChangePrompt({ country, visaType, locale = 'en' }: Props) {
  // Only Korea has the change hub currently
  if (country !== 'korea') return null;

  const transitions = await getTransitionsFrom(country as Country, visaType, locale);
  // Filter out d-4 (intermediate-only, not shown)
  const validTransitions = transitions.filter((t) => t.type !== 'd-4');

  if (validTransitions.length === 0) return null;

  const visaCode = visaType.toUpperCase();

  return (
    <div className="mt-8 rounded-xl border border-[rgba(27,73,101,0.2)] bg-[#e8f0f5] px-4 py-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#1B4965]/60">
        Visa Status Change
      </p>
      <p className="mb-3 text-sm font-semibold text-[#1B4965]">
        Looking to change your visa status?
      </p>
      <Link
        href={`/${country}/visa/change?from=${visaType}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4965] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2e6b92] transition-colors"
      >
        See {validTransitions.length} available path{validTransitions.length !== 1 ? 's' : ''} from {visaCode}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
