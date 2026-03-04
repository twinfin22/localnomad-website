'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { BLOG_CATEGORIES, BLOG_COUNTRIES } from '@/lib/blog/schema';

export const BlogFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') ?? '';
  const currentCountry = searchParams.get('country') ?? '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter('category', '')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !currentCategory
              ? 'bg-[#1B4965] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter('category', cat)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
              currentCategory === cat
                ? 'bg-[#1B4965] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter('country', '')}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            !currentCountry
              ? 'bg-[#1B4965]/80 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Countries
        </button>
        {BLOG_COUNTRIES.map((country) => (
          <button
            key={country}
            onClick={() => updateFilter('country', country)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
              currentCountry === country
                ? 'bg-[#1B4965]/80 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {country === 'sea' ? 'Southeast Asia' : country}
          </button>
        ))}
      </div>
    </div>
  );
};
