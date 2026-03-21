'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ScrollReveal } from './scroll-reveal';
import 'mapbox-gl/dist/mapbox-gl.css';

const BRAND_COLOR = '#1B4965';

const COUNTRY_FLAGS: Record<string, string> = {
  korea: '🇰🇷',
  japan: '🇯🇵',
  taiwan: '🇹🇼',
};

const COUNTRY_IMAGES: Record<string, string> = {
  korea: '/images/neighborhoods/korea-thumb.jpg',
  japan: '/images/neighborhoods/japan-thumb.jpg',
  taiwan: '/images/neighborhoods/taiwan-thumb.jpg',
};

// Capital city positions [lng, lat] for Mapbox
const COUNTRY_MAP_COORDS: Record<string, [number, number]> = {
  korea: [126.978, 37.5665],  // Seoul
  japan: [139.6503, 35.6762], // Tokyo
  taiwan: [121.5654, 25.033], // Taipei
};

interface CountryPreview {
  country: string;
  displayName: string;
  coordinates: [number, number]; // [lat, lng] — center of country
  neighborhoodCount: number;
  cityCount: number;
  topCities: string[];
}

interface NeighborhoodPreviewProps {
  countries: CountryPreview[];
}




export const NeighborhoodPreview = ({ countries }: NeighborhoodPreviewProps) => {
  const t = useTranslations('Landing');
  const locale = useLocale();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleCardHover = useCallback((country: string | null) => {
    setHoveredCountry(country);
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Fly to country or reset
    if (country) {
      const coords = COUNTRY_MAP_COORDS[country];
      if (coords) {
        map.flyTo({ center: coords, zoom: 5, duration: 600 });
      }
    } else if (boundsRef.current) {
      map.fitBounds(boundsRef.current, {
        padding: { top: 80, bottom: 80, left: 60, right: 60 },
        maxZoom: 5,
        duration: 600,
      });
    }
  }, []);

  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = token;

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/localrei/cmn0fjz7j00a101r0g1gl073v',
        projection: 'mercator',
        center: [128, 32],
        zoom: 3,
        scrollZoom: false,
        dragPan: true,
        dragRotate: false,
        doubleClickZoom: true,
        touchZoomRotate: true,
        keyboard: false,
        attributionControl: false,
      });

      map.on('load', () => {
        // GeoJSON source with country markers
        const features = countries.map((country) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: COUNTRY_MAP_COORDS[country.country] ?? [
              country.coordinates[1],
              country.coordinates[0],
            ],
          },
          properties: {
            name: country.displayName,
            country: country.country,
          },
        }));

        map.addSource('country-markers', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features,
          },
        });

        // Outer ring
        map.addLayer({
          id: 'country-markers-pulse',
          type: 'circle',
          source: 'country-markers',
          paint: {
            'circle-radius': 18,
            'circle-color': BRAND_COLOR,
            'circle-opacity': 0.12,
            'circle-stroke-width': 2,
            'circle-stroke-color': BRAND_COLOR,
            'circle-stroke-opacity': 0.2,
          },
        });

        // Inner dot
        map.addLayer({
          id: 'country-markers-dot',
          type: 'circle',
          source: 'country-markers',
          paint: {
            'circle-radius': 7,
            'circle-color': BRAND_COLOR,
            'circle-opacity': 0.9,
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Country name label
        map.addLayer({
          id: 'country-markers-label',
          type: 'symbol',
          source: 'country-markers',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 14,
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 2.2],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-letter-spacing': 0.05,
            'text-transform': 'uppercase',
          },
          paint: {
            'text-color': BRAND_COLOR,
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });

        // Click + cursor handlers
        const interactiveLayers = ['country-markers-dot', 'country-markers-pulse', 'country-markers-label'];
        interactiveLayers.forEach((layerId) => {
          map.on('click', layerId, (e) => {
            const feature = e.features?.[0];
            if (feature?.properties?.country) {
              window.location.href = `/${locale}/neighborhood/${feature.properties.country}`;
            }
          });
          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        });

        // Fit bounds to show all markers
        const bounds = new mapboxgl.default.LngLatBounds();
        features.forEach((f) => bounds.extend(f.geometry.coordinates as [number, number]));
        boundsRef.current = bounds;
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 60, right: 60 },
          maxZoom: 5,
        });
      });

      mapRef.current = map;
    });
  }, [countries, locale]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initMap();
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [initMap]);

  return (
    <section aria-labelledby="neighborhood-heading" className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-5xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 id="neighborhood-heading" className="font-lora text-3xl font-bold text-primary sm:text-4xl">
              {t('neighborhoodTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {t('neighborhoodSubtitle')}
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Edge-to-edge map with fade edges */}
      <ScrollReveal delay={200}>
        <div className="relative mt-12">
          <div className="relative">
            {/* Skeleton placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 animate-pulse">
              <svg className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <span className="text-xs text-muted-foreground/60">Loading map…</span>
            </div>
            <div
              ref={mapContainerRef}
              className="relative z-[1] h-[360px] w-full sm:h-[480px]"
            />
          </div>
          {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm text-muted-foreground">
              Map requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Country cards below map */}
      <div className="mx-auto mt-6 max-w-5xl px-6">
        <ScrollReveal delay={300}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {countries.map((c) => (
              <Link
                key={c.country}
                href={`/neighborhood/${c.country}`}
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md ${
                  hoveredCountry === c.country
                    ? 'border-primary/40 shadow-md -translate-y-0.5'
                    : 'border-border/60 hover:border-primary/30'
                }`}
                onMouseEnter={() => handleCardHover(c.country)}
                onMouseLeave={() => handleCardHover(null)}
                onFocus={() => handleCardHover(c.country)}
                onBlur={() => handleCardHover(null)}
              >
                {/* Thumbnail */}
                <div className="relative h-36 w-full overflow-hidden sm:h-40">
                  <img
                    src={COUNTRY_IMAGES[c.country] ?? '/images/placeholder.jpg'}
                    alt={c.displayName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    width={600}
                    height={400}
                  />
                </div>
                {/* Info */}
                <div className="flex flex-col gap-0.5 p-4">
                  <span className="text-base font-semibold">
                    {COUNTRY_FLAGS[c.country] && (
                      <span className="mr-1.5">{COUNTRY_FLAGS[c.country]}</span>
                    )}
                    {c.displayName}
                  </span>
                  <span className="text-sm text-primary font-lora font-bold">
                    {c.neighborhoodCount} {t('neighborhoodCount')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.topCities.join(' · ')}
                  </span>
                  <span className="mt-1.5 text-xs font-medium text-primary">
                    {t('neighborhoodExplore')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
