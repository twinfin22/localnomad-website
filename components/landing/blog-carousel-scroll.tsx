'use client';

import { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BlogCarouselScrollButtons = () => {
  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = document.getElementById('blog-carousel');
    if (!container) return;
    const scrollAmount = 360;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

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
};
