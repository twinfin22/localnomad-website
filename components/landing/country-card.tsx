import { Link } from '@/i18n/navigation';

interface CountryCardProps {
  href: string;
  emoji: string;
  name: string;
}

export const CountryCard = ({ href, emoji, name }: CountryCardProps) => {
  return (
    <Link
      href={href}
      className="group flex min-h-[88px] items-center gap-4 rounded-xl bg-white px-6 py-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <span className="text-4xl" role="img" aria-label={name}>
        {emoji}
      </span>
      <span className="text-lg font-semibold text-primary group-hover:text-primary-light transition-colors">
        {name}
      </span>
      <svg
        className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};
