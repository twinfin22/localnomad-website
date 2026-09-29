'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { NeighborhoodGrid } from '@/components/neighborhood/neighborhood-grid';
import type { City } from '@/lib/types/neighborhood';

const NeighborhoodMap = dynamic(
  () => import('@/components/neighborhood/neighborhood-map'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] rounded-lg border bg-neutral-100 animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading map...</span>
      </div>
    ),
  }
);

interface NeighborhoodExplorerProps {
  cities: City[];
  allTags: string[];
}

export function NeighborhoodExplorer({
  cities,
  allTags,
}: NeighborhoodExplorerProps) {
  const t = useTranslations('Neighborhood');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const totalCount = cities.reduce(
    (sum, c) => sum + c.neighborhoods.length,
    0
  );

  const filteredNeighborhoods = useMemo(() => {
    if (!selectedCity) {
      return cities.flatMap((c) => c.neighborhoods);
    }
    const city = cities.find((c) => c.name === selectedCity);
    return city ? city.neighborhoods : [];
  }, [selectedCity, cities]);

  return (
    <div className="space-y-6">
      {/* City filter buttons — works even without map */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCity(null)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            selectedCity === null
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-foreground border hover:bg-neutral-50'
          )}
        >
          <MapPin className="h-3.5 w-3.5" />
          All ({totalCount})
        </button>
        {cities.map((city) => (
          <button
            key={city.name}
            onClick={() =>
              setSelectedCity(selectedCity === city.name ? null : city.name)
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedCity === city.name
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-foreground border hover:bg-neutral-50'
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            {city.name} ({city.neighborhoods.length})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-y border-primary/10 py-3">
        <p className="text-sm text-muted-foreground">
          {t('browseListFirst')}
        </p>
        <button
          type="button"
          onClick={() => setIsMapOpen((open) => !open)}
          className="shrink-0 rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          aria-expanded={isMapOpen}
        >
          {isMapOpen ? t('hideMap') : t('showMap')}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* The Mapbox bundle is only requested after an explicit user action. */}
        {isMapOpen && (
          <div className="w-full lg:w-[40%]">
            <NeighborhoodMap
              cities={cities}
              selectedCity={selectedCity}
              onCitySelect={setSelectedCity}
            />
          </div>
        )}

        <div className={isMapOpen ? 'w-full lg:w-[60%]' : 'w-full'}>
          <NeighborhoodGrid
            neighborhoods={filteredNeighborhoods}
            allTags={allTags}
          />
        </div>
      </div>
    </div>
  );
}
