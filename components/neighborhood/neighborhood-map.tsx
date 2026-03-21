'use client';

import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import type { City } from '@/lib/types/neighborhood';

const BRAND_COLOR = '#1B4965';

interface NeighborhoodMapProps {
  cities: City[];
  selectedCity: string | null;
  onCitySelect: (city: string | null) => void;
}

export default function NeighborhoodMap({
  cities,
  selectedCity,
  onCitySelect,
}: NeighborhoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const createCityMarker = useCallback(
    (city: City, isActive: boolean) => {
      const count = city.neighborhoods.length;

      const el = document.createElement('div');
      el.className = 'neighborhood-city-marker';
      Object.assign(el.style, {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: `3px solid ${BRAND_COLOR}`,
        backgroundColor: isActive ? BRAND_COLOR : 'white',
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        position: 'relative',
      });

      // Count number inside the circle
      const countEl = document.createElement('span');
      countEl.textContent = String(count);
      Object.assign(countEl.style, {
        fontSize: '13px',
        fontWeight: '700',
        color: isActive ? 'white' : BRAND_COLOR,
        lineHeight: '1',
      });
      el.appendChild(countEl);

      if (isActive) {
        el.style.transform = 'scale(1.15)';
      }

      const label = document.createElement('span');
      label.textContent = city.name;
      Object.assign(label.style, {
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        fontSize: '12px',
        fontWeight: '600',
        color: BRAND_COLOR,
        textShadow:
          '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white',
      });
      el.appendChild(label);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onCitySelect(isActive ? null : city.name);
      });

      // Mapbox uses [lng, lat]
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([
        city.coordinates[1],
        city.coordinates[0],
      ]);

      return marker;
    },
    [onCitySelect]
  );

  const createNeighborhoodMarker = useCallback((name: string, coords: [number, number]) => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: BRAND_COLOR,
      opacity: '0.7',
      border: '2px solid white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    });

    const tooltip = document.createElement('div');
    tooltip.textContent = name;
    Object.assign(tooltip.style, {
      position: 'absolute',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      fontSize: '20px',
      fontWeight: '700',
      color: BRAND_COLOR,
      textShadow:
        '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white',
      pointerEvents: 'none',
    });
    el.appendChild(tooltip);

    // Mapbox uses [lng, lat]
    const marker = new mapboxgl.Marker({ element: el }).setLngLat([
      coords[1],
      coords[0],
    ]);

    return marker;
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set');
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/localrei/cmn0fjz7j00a101r0g1gl073v',
      center: [
        cities.reduce((sum, c) => sum + c.coordinates[1], 0) / cities.length,
        cities.reduce((sum, c) => sum + c.coordinates[0], 0) / cities.length,
      ],
      zoom: 5,
      scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = map;

    // Fit bounds to show all cities on load
    const bounds = new mapboxgl.LngLatBounds();
    cities.forEach((city) => {
      bounds.extend([city.coordinates[1], city.coordinates[0]]);
    });
    map.fitBounds(bounds, { padding: 60, maxZoom: 8 });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when selectedCity changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    clearMarkers();

    if (selectedCity) {
      const activeCity = cities.find((c) => c.name === selectedCity);

      // Show dimmed cluster markers for non-selected cities
      cities.forEach((city) => {
        if (city.name === selectedCity) return;
        const marker = createCityMarker(city, false);
        const el = marker.getElement();
        el.style.opacity = '0.4';
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Show individual neighborhood dots for the selected city
      if (activeCity) {
        activeCity.neighborhoods.forEach((n) => {
          const marker = createNeighborhoodMarker(n.name, n.coordinates);
          marker.addTo(map);
          markersRef.current.push(marker);
        });

        // Zoom to the selected city
        const bounds = new mapboxgl.LngLatBounds();
        activeCity.neighborhoods.forEach((n) => {
          bounds.extend([n.coordinates[1], n.coordinates[0]]);
        });
        bounds.extend([activeCity.coordinates[1], activeCity.coordinates[0]]);
        map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
      }
    } else {
      // Show cluster markers for all cities
      cities.forEach((city) => {
        const marker = createCityMarker(city, false);
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Zoom out to show all cities
      const bounds = new mapboxgl.LngLatBounds();
      cities.forEach((city) => {
        bounds.extend([city.coordinates[1], city.coordinates[0]]);
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 8, duration: 800 });
    }
  }, [selectedCity, cities, clearMarkers, createCityMarker, createNeighborhoodMarker]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-white shadow-sm',
        'h-[300px] lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]'
      )}
    >
      <div ref={mapContainerRef} className="h-full w-full" />
      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm text-muted-foreground">
          Map requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        </div>
      )}
    </div>
  );
}
