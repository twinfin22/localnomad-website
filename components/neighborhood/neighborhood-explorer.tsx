'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeighborhoodGrid } from '@/components/neighborhood/neighborhood-grid';
import type { City } from '@/lib/types/neighborhood';

const NeighborhoodMap = dynamic(
  () => import('@/components/neighborhood/neighborhood-map'),
  { ssr: false }
);

interface NeighborhoodExplorerProps {
  cities: City[];
  allTags: string[];
}

export function NeighborhoodExplorer({
  cities,
  allTags,
}: NeighborhoodExplorerProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

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

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Map sidebar */}
        <div className="w-full lg:w-[40%]">
          <NeighborhoodMap
            cities={cities}
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
          />
        </div>

        {/* Card grid */}
        <div className="w-full lg:w-[60%]">
          <NeighborhoodGrid
            neighborhoods={filteredNeighborhoods}
            allTags={allTags}
          />
        </div>
      </div>
    </div>
  );
}
