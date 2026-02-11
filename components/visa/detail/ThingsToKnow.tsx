'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface ThingsToKnowProps {
  warnings?: string[];
  tips?: string[];
  className?: string;
}

const MAX_INITIAL_ITEMS = 6;

export function ThingsToKnow({
  warnings = [],
  tips = [],
  className,
}: ThingsToKnowProps) {
  const [showAll, setShowAll] = useState(false);

  // Combine warnings (first) and tips
  const allItems = [
    ...warnings.map((text) => ({ type: 'warning' as const, text })),
    ...tips.map((text) => ({ type: 'tip' as const, text })),
  ];

  if (allItems.length === 0) return null;

  const displayedItems = showAll ? allItems : allItems.slice(0, MAX_INITIAL_ITEMS);
  const hiddenCount = allItems.length - MAX_INITIAL_ITEMS;

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        Things to Know
      </h2>

      <div className="space-y-2">
        {displayedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 py-2"
          >
            {/* Indicator dot */}
            <div className={cn(
              'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
              item.type === 'warning' ? 'bg-red-500' : 'bg-amber-500'
            )} />
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 px-3 rounded-lg bg-surface/30 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          Show {hiddenCount} more
        </button>
      )}
    </div>
  );
}
