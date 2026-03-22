'use client';

import { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollButtonsProps {
  containerId: string;
  scrollAmount?: number;
}

export function ScrollButtons({ containerId, scrollAmount = 460 }: ScrollButtonsProps) {
  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (direction === 'right') {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
          // At the end — loop back to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (container.scrollLeft <= 10) {
          // At the start — loop to end
          container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    },
    [containerId, scrollAmount]
  );

  return (
    <>
      <button
        onClick={() => scroll('left')}
        className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white p-2 shadow-md transition-all hover:shadow-lg sm:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border bg-white p-2 shadow-md transition-all hover:shadow-lg sm:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4 text-foreground" />
      </button>
    </>
  );
}
