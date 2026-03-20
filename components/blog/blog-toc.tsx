'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface BlogTocProps {
  headings: TocHeading[];
}

export function BlogToc({ headings }: BlogTocProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [hideForFooter, setHideForFooter] = useState(false);

  // Derive parent H2 for each heading
  const parentH2Map = useMemo(() => {
    const map: Record<string, string> = {};
    let currentH2 = '';
    for (const h of headings) {
      if (h.level === 2) currentH2 = h.id;
      map[h.id] = currentH2;
    }
    return map;
  }, [headings]);

  // Track active H2 based on activeId
  const activeH2 = parentH2Map[activeId] || '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  // Auto-scroll active ToC item into view
  useEffect(() => {
    if (!activeId) return;
    const el = document.querySelector(`[data-toc-id="${activeId}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  // Hide ToC when footer is visible
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHideForFooter(entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(footer);
    return () => obs.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        'hidden md:block fixed left-2 lg:left-4 top-24 w-[160px] lg:w-[200px] max-h-[calc(100vh-8rem)] overflow-y-auto transition-opacity duration-200',
        hideForFooter ? 'opacity-0 pointer-events-none' : 'opacity-100',
      )}
    >
      <ul className="space-y-0.5">
        {headings.map((heading) => {
          const visible =
            heading.level === 2 || parentH2Map[heading.id] === activeH2;
          if (!visible) return null;

          return (
            <li key={heading.id}>
              <button
                type="button"
                data-toc-id={heading.id}
                onClick={() => handleClick(heading.id)}
                className={cn(
                  'block w-full text-left leading-snug transition-colors border-l-2',
                  heading.level === 2 && 'pl-3 py-1.5 text-sm',
                  heading.level === 3 && 'pl-6 py-1 text-xs',
                  activeId === heading.id
                    ? 'border-[#1B4965] font-medium text-[#1B4965]'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
