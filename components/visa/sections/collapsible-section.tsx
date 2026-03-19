'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  count?: number;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  /** Optional badge content (e.g. document progress "3/11") */
  badge?: ReactNode;
}

export function CollapsibleSection({
  id,
  icon,
  title,
  count,
  summary,
  defaultOpen = true,
  children,
  className,
  badge,
}: CollapsibleSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 rounded-lg border p-5', className)}>
      <details open={defaultOpen || undefined} className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-lora text-xl font-bold text-primary">{title}</h2>
              {count != null && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                  {count}
                </span>
              )}
              {badge}
            </div>
            {summary && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {summary}
              </p>
            )}
          </div>
          <svg
            className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </summary>
        <div className="pt-4">{children}</div>
      </details>
    </section>
  );
}
