import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getNeighborhoodData } from '@/lib/neighborhood-data';
import { ScrollButtons } from './scroll-buttons';

interface NeighborhoodScrollProps {
  country: string;
  displayName: string;
}

export async function NeighborhoodScroll({
  country,
  displayName,
}: NeighborhoodScrollProps) {
  const data = await getNeighborhoodData(country);

  // Flatten neighborhoods with city name attached
  const neighborhoods =
    data?.cities.flatMap((c) =>
      c.neighborhoods.map((n) => ({ ...n, cityName: c.name }))
    ) ?? [];

  if (neighborhoods.length === 0) return null;

  return (
    <section className="bg-neutral-50 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-lora text-2xl font-bold text-primary sm:text-3xl">
          Where to Live in {displayName}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore neighborhoods by rent, vibe, and walkability
        </p>

        {/* Horizontal scroll container */}
        <div className="relative mt-6">
          <ScrollButtons containerId={`neighborhood-scroll-${country}`} scrollAmount={460} />
          <div
            id={`neighborhood-scroll-${country}`}
            className="-mx-4 px-4 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            <div
              className="flex gap-3 pb-4 [&::-webkit-scrollbar]:hidden"
              style={{ width: 'max-content' }}
            >
              {neighborhoods.map((neighborhood) => (
                <Link
                  key={`${neighborhood.cityName}-${neighborhood.name}`}
                  href={`/neighborhood/${country}`}
                  className="w-[200px] sm:w-[220px] shrink-0"
                >
                  <div className="rounded-lg border bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full">
                    {/* Top image */}
                    <div className="h-28 sm:h-32 bg-neutral-100 overflow-hidden">
                      {neighborhood.imageUrl ? (
                        <img
                          src={neighborhood.imageUrl}
                          alt={neighborhood.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Card content */}
                    <div className="p-3">
                      <p className="font-semibold text-sm text-foreground">
                        {neighborhood.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {neighborhood.cityName}
                      </p>
                      <p className="text-xs text-primary font-medium mt-1.5">
                        {neighborhood.rent}
                      </p>
                      {neighborhood.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {neighborhood.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-primary/5 text-primary/70 rounded px-1.5 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Explore all link */}
        <Link
          href={`/neighborhood/${country}`}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
        >
          Explore all {neighborhoods.length} neighborhoods
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
