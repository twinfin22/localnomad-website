'use client';

import { useEffect, useRef, useCallback } from 'react';
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

  const handleCardHover = useCallback((country: string | null) => {
    const map = mapRef.current;
    if (!map) return;
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
        style: 'mapbox://styles/mapbox/light-v11',
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

        // Lodging icon + country name label
        map.addLayer({
          id: 'country-markers-icon',
          type: 'symbol',
          source: 'country-markers',
          layout: {
            'icon-image': 'globe',
            'icon-size': 3,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-size': 13,
            'text-font': ['DIN Pro SemiBold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 1.4],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-letter-spacing': 0.02,
          },
          paint: {
            'icon-color': BRAND_COLOR,
            'text-color': BRAND_COLOR,
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });

        // Click → navigate to neighborhood page
        map.on('click', 'country-markers-icon', (e) => {
          const feature = e.features?.[0];
          if (feature?.properties?.country) {
            window.location.href = `/${locale}/neighborhood/${feature.properties.country}`;
          }
        });

        // Hover tooltip + pointer cursor
        let popup: InstanceType<typeof mapboxgl.default.Popup> | null = null;
        map.on('mouseenter', 'country-markers-icon', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          const feature = e.features?.[0];
          if (feature?.geometry.type === 'Point' && feature.properties) {
            const match = countries.find((c) => c.country === feature.properties!.country);
            if (match) {
              popup = new mapboxgl.default.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 20,
                className: 'landing-map-popup',
              })
                .setLngLat(feature.geometry.coordinates as [number, number])
                .setHTML(`<strong>${match.displayName}</strong><br/>${match.cityCount} cities · ${match.neighborhoodCount} neighborhoods`)
                .addTo(map);
            }
          }
        });
        map.on('mouseleave', 'country-markers-icon', () => {
          map.getCanvas().style.cursor = '';
          popup?.remove();
          popup = null;
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
    <section aria-labelledby="neighborhood-heading" className="relative overflow-hidden bg-neutral-50 px-6 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
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

        <ScrollReveal delay={200}>
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-border/60 bg-neutral-50 shadow-sm">
            <div className="relative">
              {/* Skeleton placeholder — visible until map loads */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 animate-pulse">
                <svg className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                <span className="text-xs text-muted-foreground/60">Loading map…</span>
              </div>
              <div
                ref={mapContainerRef}
                className="relative z-[1] h-[280px] w-full sm:h-[400px]"
              />
            </div>
            {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm text-muted-foreground">
                Map requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              </div>
            )}

          </div>

          {/* Country cards below map */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {countries.map((c) => (
              <Link
                key={c.country}
                href={`/neighborhood/${c.country}`}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                onMouseEnter={() => handleCardHover(c.country)}
                onMouseLeave={() => handleCardHover(null)}
              >
                {/* Thumbnail */}
                <div className="relative h-36 w-full overflow-hidden sm:h-40">
                  <img
                    src={COUNTRY_IMAGES[c.country] ?? '/images/placeholder.jpg'}
                    alt={c.displayName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
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
