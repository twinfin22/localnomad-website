'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TocSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TocProps {
  sections: TocSection[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

/** Horizontal pill bar — sticks below breadcrumb on mobile/tablet */
export function MobileTocBar({
  sections,
  activeSection,
  onNavigate,
}: TocProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep active pill centered
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeSection]);

  return (
    <div className="sticky top-[41px] z-[9] -mx-6 overflow-x-auto border-b bg-white/95 px-6 py-2 backdrop-blur-sm md:hidden">
      <div className="flex gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            ref={activeSection === section.id ? activeRef : undefined}
            type="button"
            onClick={() => onNavigate(section.id)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              activeSection === section.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-neutral-100 text-muted-foreground hover:bg-neutral-200'
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Vertical sidebar — floats on left side of viewport on xl+ screens */
export function DesktopTocSidebar({
  sections,
  activeSection,
  onNavigate,
}: TocProps) {
  return (
    <nav
      aria-label="Table of contents"
      className="fixed left-6 top-1/2 z-10 hidden w-[180px] -translate-y-1/2 md:block"
    >
      <ul className="space-y-0.5">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onNavigate(section.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeSection === section.id
                  ? 'border-l-2 border-primary bg-primary/8 font-medium text-primary'
                  : 'border-l-2 border-transparent text-muted-foreground hover:bg-primary/[0.04] hover:text-foreground'
              )}
            >
              <span className="shrink-0">{section.icon}</span>
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
