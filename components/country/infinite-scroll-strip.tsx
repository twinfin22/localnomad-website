'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InfiniteScrollStripProps {
  children: ReactNode;
  scrollAmount?: number;
}

export function InfiniteScrollStrip({ children, scrollAmount = 460 }: InfiniteScrollStripProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isResetting = useRef(false);

  // Once the duplicate set is rendered, jump to the start of the "real" set (clone is prepended)
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Each child set is half of inner's scrollWidth
    const halfWidth = inner.scrollWidth / 2;
    // Start at the beginning of the second (real) copy
    outer.scrollLeft = halfWidth;
  }, []);

  const handleScroll = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || isResetting.current) return;

    const halfWidth = inner.scrollWidth / 2;

    if (outer.scrollLeft <= 0) {
      // Scrolled past the prepended clone → jump to real set
      isResetting.current = true;
      outer.scrollLeft = halfWidth;
      isResetting.current = false;
    } else if (outer.scrollLeft >= halfWidth) {
      // Scrolled past the real set → jump back to clone
      isResetting.current = true;
      outer.scrollLeft = outer.scrollLeft - halfWidth;
      isResetting.current = false;
    }
  }, []);

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const outer = outerRef.current;
      if (!outer) return;
      outer.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    },
    [scrollAmount]
  );

  return (
    <div className="relative">
      {/* Scroll buttons — desktop only */}
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

      <div
        ref={outerRef}
        onScroll={handleScroll}
        className="-mx-4 px-4 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        <div
          ref={innerRef}
          className="flex gap-3 pb-4 [&::-webkit-scrollbar]:hidden"
          style={{ width: 'max-content' }}
        >
          {/* Duplicate: clone before real for seamless loop */}
          {children}
          {children}
        </div>
      </div>
    </div>
  );
}
