import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export function ToolCard({
  icon: Icon,
  title,
  description,
  href,
  ctaLabel,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group cursor-pointer block rounded-xl border bg-white p-5 sm:p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
