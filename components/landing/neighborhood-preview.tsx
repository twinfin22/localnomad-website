'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MapPin } from 'lucide-react';
import { ScrollReveal } from './scroll-reveal';
import 'mapbox-gl/dist/mapbox-gl.css';

const BRAND_COLOR = '#1B4965';

interface CountryPreview {
  country: string;
  displayName: string;
  coordinates: [number, number]; // [lat, lng] — center of country
  neighborhoodCount: number;
  cityCount: number;
}

interface NeighborhoodPreviewProps {
  countries: CountryPreview[];
}

export const NeighborhoodPreview = ({ countries }: NeighborhoodPreviewProps) => {
  const t = useTranslations('Landing');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const initMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = token;

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [121, 33],
        zoom: 3,
        scrollZoom: false,
        dragPan: false,
        dragRotate: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        keyboard: false,
        attributionControl: false,
        interactive: false,
      });

      map.on('load', () => {
        const bounds = new mapboxgl.default.LngLatBounds();

        countries.forEach((country) => {
          const el = document.createElement('div');
          el.className = 'landing-country-marker';
          Object.assign(el.style, {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: `3px solid ${BRAND_COLOR}`,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(27,73,101,0.25)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
          });

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.1)';
            el.style.boxShadow = '0 4px 16px rgba(27,73,101,0.35)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '0 2px 8px rgba(27,73,101,0.25)';
          });

          const countEl = document.createElement('span');
          countEl.textContent = String(country.neighborhoodCount);
          Object.assign(countEl.style, {
            fontSize: '15px',
            fontWeight: '700',
            color: BRAND_COLOR,
            lineHeight: '1',
          });
          el.appendChild(countEl);

          const label = document.createElement('span');
          label.textContent = country.displayName;
          Object.assign(label.style, {
            position: 'absolute',
            top: '52px',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            fontWeight: '600',
            color: BRAND_COLOR,
            textShadow:
              '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white',
            letterSpacing: '0.02em',
          });
          el.appendChild(label);

          new mapboxgl.default.Marker({ element: el })
            .setLngLat([country.coordinates[1], country.coordinates[0]])
            .addTo(map);

          bounds.extend([country.coordinates[1], country.coordinates[0]]);
        });

        map.fitBounds(bounds, { padding: 80, maxZoom: 5 });
      });

      mapRef.current = map;
    });
  }, [countries]);

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
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
              <MapPin className="h-3 w-3" />
              {t('neighborhoodBadge')}
            </span>
            <h2 className="mt-4 font-lora text-3xl font-bold text-primary sm:text-4xl">
              {t('neighborhoodTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {t('neighborhoodSubtitle')}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="relative mt-12 overflow-hidden rounded-2xl border border-border/60 bg-neutral-50 shadow-sm">
            <div
              ref={mapContainerRef}
              className="h-[320px] w-full sm:h-[400px]"
            />
            {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm text-muted-foreground">
                Map requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              </div>
            )}

          </div>

          {/* Stats grid below map */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {countries.map((c) => (
              <Link
                key={c.country}
                href={`/neighborhood/${c.country}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-white p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md"
              >
                <span className="text-lg">{c.displayName}</span>
                <span className="text-2xl font-bold font-lora text-primary">
                  {c.neighborhoodCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('neighborhoodCount')}
                </span>
                <span className="mt-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {t('neighborhoodExplore')} →
                </span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
