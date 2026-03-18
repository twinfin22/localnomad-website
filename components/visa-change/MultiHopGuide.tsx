import { ArrowRight } from 'lucide-react';

interface MultiHopGuideProps {
  ultimateDestination: string;
  /** The current transition being highlighted, e.g. "e-7" → "f-2" */
  fromCode: string;
  toCode: string;
}

/**
 * Parses the ultimateDestination text like "E-7 → F-2 → F-5" into hop segments.
 * Falls back to displaying raw text if parsing fails.
 */
function parseHops(text: string): string[] {
  // Try arrow-separated format: "H-1 → E-7 → F-2 → F-5"
  const arrowParts = text.split(/\s*[→\->\u2192]+\s*/);
  if (arrowParts.length > 1) return arrowParts.map((s) => s.trim()).filter(Boolean);
  return [text];
}

export function MultiHopGuide({ ultimateDestination, fromCode, toCode }: MultiHopGuideProps) {
  const hops = parseHops(ultimateDestination);
  const fromUpper = fromCode.toUpperCase();
  const toUpper = toCode.toUpperCase();

  return (
    <div className="rounded-lg border border-[rgba(27,73,101,0.15)] bg-[#e8f0f5] p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1B4965]">
        The bigger picture
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {hops.map((hop, i) => {
          const hopUpper = hop.toUpperCase().replace(/\s/g, '').replace('→', '');
          const isCurrent =
            hopUpper === fromUpper.replace(/\s/g, '') || hopUpper === toUpper.replace(/\s/g, '');
          return (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className={
                  isCurrent
                    ? 'rounded border border-[#1B4965] bg-[#e8f0f5] px-2 py-0.5 text-sm font-extrabold text-[#1B4965]'
                    : 'rounded border border-slate-200 bg-white px-2 py-0.5 text-sm font-semibold text-slate-500'
                }
              >
                {hop}
              </span>
              {i < hops.length - 1 && (
                <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
