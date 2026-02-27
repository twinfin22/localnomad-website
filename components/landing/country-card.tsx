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
      className="group flex min-h-[88px] items-center gap-4 rounded-xl border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
    >
      <span className="text-4xl" role="img" aria-label={name}>
        {emoji}
      </span>
      <div className="text-left">
        <span className="text-lg font-semibold text-white transition-colors">
          {name}
        </span>
        {description && (
          <p className="mt-0.5 text-sm text-white/60">{description}</p>
        )}
      </div>
      <svg
        className="ml-auto h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
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
