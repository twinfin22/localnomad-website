import { Link } from '@/i18n/navigation';

interface CountryCardProps {
  href: string;
  emoji: string;
  name: string;
  description?: string;
}

export const CountryCard = ({
  href,
  emoji,
  name,
  description,
}: CountryCardProps) => {
  return (
    <Link
      href={href}
      className="group flex min-h-[88px] items-center gap-4 rounded-xl border border-white/20 bg-white/10 px-6 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-white/[0.15] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_12px_40px_rgba(0,0,0,0.2),inset_0_0_20px_rgba(255,255,255,0.05)] focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
        <span className="text-3xl" role="img" aria-label={name}>
          {emoji}
        </span>
      </div>
      <div className="text-left">
        <span className="text-lg font-semibold text-white transition-colors">
          {name}
        </span>
        {description && (
          <p className="mt-0.5 text-sm text-white/60">{description}</p>
        )}
      </div>
      <svg
        className="ml-auto h-5 w-5 text-white/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/80"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
};
