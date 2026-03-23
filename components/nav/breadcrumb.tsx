import { ChevronRight, House } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** "inline" = plain list (default), "band" = full-width sticky bar */
  variant?: 'inline' | 'band';
}

export function Breadcrumb({ items, variant = 'inline' }: BreadcrumbProps) {
  const list = (
    <ol className="flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const isFirst = i === 0;
        return (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
            )}
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={isLast ? 'font-medium text-foreground' : ''}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                {isFirst && (
                  <House className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {isFirst ? <span className="sr-only">{item.label}</span> : item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );

  if (variant === 'band') {
    return (
      <nav
        aria-label="Breadcrumb"
        className="sticky top-0 z-10 border-b bg-white/95 shadow-sm backdrop-blur-sm"
      >
        <div className="mx-auto max-w-3xl px-6 py-2.5">
          {list}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb">
      {list}
    </nav>
  );
}
