import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: 'Page Not Found | LocalNomad',
  robots: { index: false },
};

const POPULAR_LINKS = [
  { href: '/korea', label: 'Korea' },
  { href: '/japan', label: 'Japan' },
  { href: '/taiwan', label: 'Taiwan' },
  { href: '/china', label: 'China' },
  { href: '/blog', label: 'Blog' },
];

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center"
    >
      <h1 className="font-lora text-5xl font-bold text-[#1B4965]">404</h1>
      <p className="mt-4 text-xl text-foreground">Page Not Found</p>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-lg bg-[#1B4965] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>

      <div className="mt-10">
        <p className="text-sm font-medium text-muted-foreground">
          Popular pages
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {POPULAR_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
