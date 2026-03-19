import { getTransitionsFrom } from '@/lib/visa-transitions';
import type { Country } from '@/lib/types/visa';
import { TransitionDetailCard } from './TransitionDetailCard';
import { NationalityBanner } from './NationalityBanner';
import { ChangeDisclaimer } from './ChangeDisclaimer';
import { Link } from '@/i18n/navigation';

interface TransitionResultsProps {
  from: string;
  fromName: string;
  country: Country;
  locale: string;
}

const DEAD_END_VISAS = ['f-5'];

export async function TransitionResults({
  from,
  fromName,
  country,
  locale,
}: TransitionResultsProps) {
  const transitions = await getTransitionsFrom(country, from, locale);

  // Filter out d-4 (not in scope for v1 hub)
  const filtered = transitions.filter((t) => t.type !== 'd-4');

  const hasNationalityDependent = filtered.some((t) => t.nationalityDependent);
  const isDeadEnd = DEAD_END_VISAS.includes(from);

  return (
    <section aria-label={`Transition options from ${fromName}`}>
      {/* Disclaimer above results */}
      <div className="mb-4">
        <ChangeDisclaimer position="above" />
      </div>

      {/* Selected visa header */}
      <div className="mb-4">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[#1B4965] px-3 py-1 text-sm font-semibold text-white">
          <span>{from.toUpperCase()}</span>
          <span className="text-white/60">·</span>
          <span className="text-white/80 text-xs">{fromName}</span>
        </div>
        <h2 className="mt-2 text-lg font-bold text-foreground">
          Where can you go from {from.toUpperCase()}?
        </h2>
        <p className="text-sm text-slate-500">
          {filtered.length > 0
            ? `${filtered.length} in-country change path${filtered.length === 1 ? '' : 's'} confirmed`
            : 'No direct in-country change paths found'}
        </p>
      </div>

      {/* Nationality banner at top if any transition is nationality-dependent */}
      {hasNationalityDependent && (
        <div className="mb-4">
          <NationalityBanner notes="Some paths below are only available for certain passport holders. See individual cards for details." />
        </div>
      )}

      {/* Dead end / permanent visa state */}
      {isDeadEnd && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-6 text-center">
          <p className="text-sm leading-relaxed text-slate-600">
            <strong>F-5 is Korea&apos;s Permanent Resident visa</strong> — no further in-country status
            changes are required. F-5 holders have unrestricted work rights and long-term residency.
          </p>
        </div>
      )}

      {/* No transitions found */}
      {filtered.length === 0 && !isDeadEnd && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-6 text-center">
          <p className="text-sm leading-relaxed text-slate-600">
            Limited in-country change options from {from.toUpperCase()}.{' '}
            <Link
              href={`/${country}/visa/${from}`}
              className="font-semibold text-[#1B4965] underline underline-offset-2"
            >
              View {from.toUpperCase()} visa details
            </Link>{' '}
            for renewal and alternative paths.
          </p>
        </div>
      )}

      {/* Transition cards */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((transition) => (
            <TransitionDetailCard
              key={transition.type}
              from={from}
              fromName={fromName}
              transition={transition}
              locale={locale}
              country={country}
            />
          ))}
        </div>
      )}

      {/* Disclaimer below results */}
      <div className="mt-6">
        <ChangeDisclaimer position="below" />
      </div>
    </section>
  );
}
