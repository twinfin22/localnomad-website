'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ScrollReveal } from './scroll-reveal';
import { InfiniteScrollStrip } from '../country/infinite-scroll-strip';

const BRAND_COLOR = '#1B4965';

export interface NeighborhoodCardData {
  name: string;
  city: string;
  country: string;
  countryFlag: string;
  rent: string;
  tags: string[];
  imageUrl: string;
  coordinates: [number, number]; // [lat, lng]
}

interface NeighborhoodPreviewProps {
  neighborhoods: NeighborhoodCardData[];
}

export const NeighborhoodPreview = ({ neighborhoods }: NeighborhoodPreviewProps) => {
  const t = useTranslations('Landing');
  const locale = useLocale();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);

  const handleCardHover = useCallback((hood: NeighborhoodCardData | null) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 600;

    if (hood) {
      map.flyTo({
        center: [hood.coordinates[1], hood.coordinates[0]],
        zoom: 10,
        duration,
      });
    } else if (boundsRef.current) {
      map.fitBounds(boundsRef.current, {
        padding: { top: 80, bottom: 80, left: 60, right: 60 },
        maxZoom: 5,
        duration,
      });
    }
  }, []);

  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    // @ts-expect-error -- CSS dynamic import has no type declarations
    import('mapbox-gl/dist/mapbox-gl.css').catch(() => {});
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
        const features = neighborhoods.map((hood) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [hood.coordinates[1], hood.coordinates[0]] as [number, number],
          },
          properties: {
            name: hood.name,
            country: hood.country,
            city: hood.city,
          },
        }));

        map.addSource('neighborhood-markers', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
        });

        // Outer ring
        map.addLayer({
          id: 'hood-markers-pulse',
          type: 'circle',
          source: 'neighborhood-markers',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 6, 8, 14],
            'circle-color': BRAND_COLOR,
            'circle-opacity': 0.1,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': BRAND_COLOR,
            'circle-stroke-opacity': 0.15,
          },
        });

        // Inner dot
        map.addLayer({
          id: 'hood-markers-dot',
          type: 'circle',
          source: 'neighborhood-markers',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 8, 6],
            'circle-color': BRAND_COLOR,
            'circle-opacity': 0.85,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Labels — visible only at higher zoom
        map.addLayer({
          id: 'hood-markers-label',
          type: 'symbol',
          source: 'neighborhood-markers',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 6, 0, 8, 12],
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-letter-spacing': 0.03,
          },
          paint: {
            'text-color': BRAND_COLOR,
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 8, 1],
          },
        });

        // Click + cursor handlers
        const interactiveLayers = ['hood-markers-dot', 'hood-markers-pulse'];
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
  }, [neighborhoods, locale]);

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

      {/* Edge-to-edge map — no ScrollReveal to avoid timing conflict with lazy-load */}
      <div className="relative mt-12">
        <div
          ref={mapContainerRef}
          className="h-[360px] w-full bg-neutral-100 sm:h-[480px]"
        />
      </div>

      {/* Neighborhood carousel */}
      <div className="mx-auto mt-6 max-w-5xl px-6">
        {/* No ScrollReveal — same pattern as map (commit 422a94c): timing conflict with scroll init */}
          <InfiniteScrollStrip scrollAmount={424}>
            {neighborhoods.map((hood) => (
              <Link
                key={`${hood.country}-${hood.name}`}
                href={`/neighborhood/${hood.country}`}
                className="group flex w-[200px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-shadow transition-colors duration-200 hover:border-primary/30 hover:shadow-md sm:w-[220px]"
                onMouseEnter={() => handleCardHover(hood)}
                onMouseLeave={() => handleCardHover(null)}
              >
                {/* Thumbnail */}
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={hood.imageUrl}
                    alt={hood.name}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* Info */}
                <div className="flex flex-col gap-0.5 p-3">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {hood.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {hood.countryFlag} {hood.city}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {hood.rent}
                  </span>
                  {hood.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {hood.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </InfiniteScrollStrip>
      </div>
    </section>
  );
};
