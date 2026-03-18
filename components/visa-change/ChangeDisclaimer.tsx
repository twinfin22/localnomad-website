import { Info } from 'lucide-react';

interface ChangeDisclaimerProps {
  position: 'above' | 'below';
}

export function ChangeDisclaimer({ position }: ChangeDisclaimerProps) {
  if (position === 'above') {
    return (
      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-100 p-3 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <p>
          Based on published Korean immigration guidelines. This is not legal advice. For your
          specific situation, consult a licensed immigration consultant (행정사) or attorney (변호사).
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3 text-xs leading-relaxed text-slate-400">
      <p>
        Information for general reference only. Final decisions on visa status changes rest solely
        with Korea Immigration Service. Requirements may change — always verify with the official
        source before applying.
      </p>
    </div>
  );
}
