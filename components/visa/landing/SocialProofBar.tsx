import { getVisaTypes } from '@/lib/visa/data';

interface SocialProofBarProps {
  className?: string;
}

export function SocialProofBar({ className }: SocialProofBarProps) {
  const visaCount = getVisaTypes().length;
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={className}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 py-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{visaCount}</span>
            <span>visa types covered</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span>Updated</span>
            <span className="font-semibold text-slate-300">{formattedDate}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-2">
            <span>Based on</span>
            <span className="font-semibold text-slate-300">official requirements</span>
          </div>
        </div>
      </div>
    </div>
  );
}
