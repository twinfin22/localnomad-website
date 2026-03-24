'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { NeighborhoodCard } from '@/components/neighborhood/neighborhood-card';
import type { Neighborhood } from '@/lib/types/neighborhood';

interface NeighborhoodGridProps {
  neighborhoods: Neighborhood[];
  allTags: string[];
}

export function NeighborhoodGrid({
  neighborhoods,
  allTags,
}: NeighborhoodGridProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const resetTags = () => {
    setSelectedTags(new Set());
  };

  const filtered = useMemo(() => {
    if (selectedTags.size === 0) return neighborhoods;
    return neighborhoods.filter((n) =>
      n.tags.some((tag) => selectedTags.has(tag))
    );
  }, [neighborhoods, selectedTags]);

  return (
    <div>
      {/* Tag filter chips */}
      <div className="flex flex-wrap gap-2 pb-4">
        <button
          onClick={resetTags}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            selectedTags.size === 0
              ? 'bg-primary text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          )}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              selectedTags.has(tag)
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((neighborhood, i) => (
          <NeighborhoodCard
            key={neighborhood.name}
            neighborhood={neighborhood}
            priority={i < 2}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No neighborhoods match the selected tags.
        </p>
      )}
    </div>
  );
}
