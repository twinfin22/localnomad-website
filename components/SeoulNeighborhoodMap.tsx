"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";

interface Neighborhood {
  id: string;
  name: string;
  intro: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
  radius: number;
}

const neighborhoods: Neighborhood[] = [
  {
    id: "yongsan",
    name: "Yongsan",
    intro: "Central Seoul hub",
    description: "Central Seoul, where business, transport, and everyday life intersect.",
    lng: 126.9784,
    lat: 37.5326,
    color: "#4A90A4",
    radius: 1000,
  },
  {
    id: "junggu",
    name: "Jung-gu",
    intro: "Historic core",
    description: "Seoul's historic core — government offices, old streets, and quiet routines.",
    lng: 126.9975,
    lat: 37.5636,
    color: "#8B7355",
    radius: 900,
  },
  {
    id: "gangnam",
    name: "Gangnam",
    intro: "Tech & startups",
    description: "Tech, startups, and fast-moving city life with global connections.",
    lng: 127.0276,
    lat: 37.4979,
    color: "#5C6BC0",
    radius: 1200,
  },
  {
    id: "itaewon",
    name: "Itaewon",
    intro: "International district",
    description: "The most international part of Seoul — diverse, flexible, and culturally open.",
    lng: 126.9942,
    lat: 37.5345,
    color: "#E57373",
    radius: 800,
  },
  {
    id: "mapo",
    name: "Mapo (Hongdae / Yeonnam)",
    intro: "Creative & youthful",
    description: "Creative, youthful, and walkable — cafés, freelancers, and late nights.",
    lng: 126.9236,
    lat: 37.5566,
    color: "#FFB74D",
    radius: 1100,
  },
  {
    id: "jongno",
    name: "Jongno",
    intro: "Traditional Seoul",
    description: "Traditional Seoul with deep history, markets, and administrative offices.",
    lng: 126.9920,
    lat: 37.5729,
    color: "#81C784",
    radius: 950,
  },
  {
    id: "seongsu",
    name: "Seongsu",
    intro: "Industrial-creative",
    description: "Industrial-turned-creative — studios, cafés, and modern urban culture.",
    lng: 127.0558,
    lat: 37.5446,
    color: "#BA68C8",
    radius: 900,
  },
  {
    id: "songpa",
    name: "Songpa (Jamsil)",
    intro: "Family-oriented",
    description: "Clean, spacious, and family-oriented with parks and newer housing.",
    lng: 127.1058,
    lat: 37.5145,
    color: "#4DB6AC",
    radius: 1100,
  },
  {
    id: "hannam",
    name: "Hannam",
    intro: "Quiet luxury",
    description: "Quiet luxury, embassies, and curated living — discreet and international.",
    lng: 127.0048,
    lat: 37.5340,
    color: "#7986CB",
    radius: 800,
  },
];

const defaultSeoulBounds: [[number, number], [number, number]] = [
  [126.76, 37.43],
  [127.18, 37.70],
];

function createWorldMaskWithHole(seoulCoords: [number, number][]): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]],
        seoulCoords,
      ],
    },
  };
}

function generateCirclePolygon(
  lng: number,
  lat: number,
  radiusMeters: number,
  points: number = 64
): [number, number][] {
  const coords: [number, number][] = [];
  const earthRadius = 6371000;
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (radiusMeters / earthRadius) * Math.cos(angle);
    const dLng = (radiusMeters / (earthRadius * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coords.push([lng + (dLng * 180) / Math.PI, lat + (dLat * 180) / Math.PI]);
  }
  
  return coords;
}

function createGeoJSON(activeId: string | null): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: neighborhoods.map((n) => ({
      type: "Feature" as const,
      id: n.id,
      properties: {
        id: n.id,
        name: n.name,
        color: n.color,
        isActive: n.id === activeId,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [generateCirclePolygon(n.lng, n.lat, n.radius)],
      },
    })),
  };
}

function StaticMapFallback({ 
  activeNeighborhood, 
  onHover, 
  onClick 
}: { 
  activeNeighborhood: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  return (
    <div className="relative w-full h-full bg-muted overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[90%] h-[90%]">
          {neighborhoods.map((n) => {
            const x = ((n.lng - 126.75) / (127.20 - 126.75)) * 100;
            const y = ((37.70 - n.lat) / (37.70 - 37.40)) * 100;
            const isActive = activeNeighborhood === n.id;
            const size = (n.radius / 1200) * 60;
            
            return (
              <button
                key={n.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 cursor-pointer focus:outline-none"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: isActive ? `${n.color}80` : `${n.color}40`,
                  border: `2px solid ${n.color}`,
                  boxShadow: isActive ? `0 0 12px ${n.color}60` : "none",
                }}
                onMouseEnter={() => onHover(n.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onClick(n.id)}
                aria-label={`Select ${n.name}`}
              />
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
        Seoul, South Korea
      </div>
    </div>
  );
}

export function SeoulNeighborhoodMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const hasToken = Boolean(token && token.length > 0);

  const handleNeighborhoodChange = useCallback((id: string | null) => {
    setActiveNeighborhood(id);
  }, []);

  const handleHover = useCallback((id: string | null) => {
    handleNeighborhoodChange(id);
  }, [handleNeighborhoodChange]);

  const handleClick = useCallback((id: string) => {
    handleNeighborhoodChange(id);
  }, [handleNeighborhoodChange]);

  useEffect(() => {
    if (!hasToken || !mapContainer.current || map.current) return;

    const initMap = async () => {
      try {
        const seoulResponse = await fetch("/data/seoul-boundary.geojson");
        const seoulGeoJSON = await seoulResponse.json() as GeoJSON.FeatureCollection;
        const seoulFeature = seoulGeoJSON.features[0];
        const seoulGeometry = seoulFeature.geometry as GeoJSON.Polygon;
        const seoulCoords = seoulGeometry.coordinates[0] as [number, number][];

        const lngs = seoulCoords.map(c => c[0]);
        const lats = seoulCoords.map(c => c[1]);
        const seoulBounds: [[number, number], [number, number]] = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ];

        mapboxgl.accessToken = token!;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [126.97, 37.56],
          zoom: 10,
          minZoom: 9.5,
          maxZoom: 14,
          pitchWithRotate: false,
          dragRotate: false,
          touchPitch: false,
          failIfMajorPerformanceCaveat: false,
        });

        map.current = mapInstance;

        mapInstance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        mapInstance.on("load", () => {
          mapInstance.fitBounds(seoulBounds, {
            padding: { top: 40, bottom: 40, left: 40, right: 40 },
            duration: 0,
          });

          mapInstance.addSource("seoul-mask", {
            type: "geojson",
            data: createWorldMaskWithHole(seoulCoords),
          });

          mapInstance.addLayer({
            id: "seoul-outside-dim",
            type: "fill",
            source: "seoul-mask",
            paint: {
              "fill-color": "#1f2937",
              "fill-opacity": 0.12,
            },
          });

          mapInstance.addSource("seoul-boundary", {
            type: "geojson",
            data: seoulFeature,
          });

          mapInstance.addLayer({
            id: "seoul-boundary-line",
            type: "line",
            source: "seoul-boundary",
            paint: {
              "line-color": "#374151",
              "line-width": 1.5,
              "line-opacity": 0.3,
            },
          });

          mapInstance.addSource("neighborhoods", {
            type: "geojson",
            data: createGeoJSON(null),
          });

          mapInstance.addLayer({
            id: "neighborhoods-fill",
            type: "fill",
            source: "neighborhoods",
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": [
                "case",
                ["boolean", ["get", "isActive"], false],
                0.5,
                0.2,
              ],
            },
          });

          mapInstance.addLayer({
            id: "neighborhoods-outline",
            type: "line",
            source: "neighborhoods",
            paint: {
              "line-color": ["get", "color"],
              "line-width": [
                "case",
                ["boolean", ["get", "isActive"], false],
                3,
                1.5,
              ],
              "line-opacity": 0.8,
            },
          });

          mapInstance.on("mousemove", "neighborhoods-fill", (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const id = feature.properties?.id;
              if (id) {
                mapInstance.getCanvas().style.cursor = "pointer";
                setActiveNeighborhood(id);
              }
            }
          });

          mapInstance.on("mouseleave", "neighborhoods-fill", () => {
            mapInstance.getCanvas().style.cursor = "";
            setActiveNeighborhood(null);
          });

          mapInstance.on("click", "neighborhoods-fill", (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const id = feature.properties?.id;
              if (id) {
                setActiveNeighborhood(id);
              }
            }
          });

          setMapLoaded(true);
        });

        mapInstance.on("error", (e) => {
          console.error("Mapbox error:", e);
          setMapError(true);
        });
      } catch (e) {
        console.error("Mapbox initialization error:", e);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [hasToken, token]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const source = map.current.getSource("neighborhoods") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(createGeoJSON(activeNeighborhood));
    }
  }, [mapLoaded, activeNeighborhood]);

  const activeData = neighborhoods.find((n) => n.id === activeNeighborhood);
  const showStaticFallback = !hasToken || mapError;

  return (
    <section className="w-full py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-fluid-section font-bold text-center mb-4 text-primary text-balance">
          Choose Your Neighborhood
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto text-fluid-body">
          Explore Seoul&apos;s diverse neighborhoods and find the perfect place for your soft landing.
        </p>

        <div className="flex flex-col md:flex-row rounded-xl overflow-hidden border bg-card shadow-lg">
          <div className="w-full md:w-2/3 h-[320px] md:h-[480px] relative bg-muted">
            {showStaticFallback ? (
              <StaticMapFallback
                activeNeighborhood={activeNeighborhood}
                onHover={handleHover}
                onClick={handleClick}
              />
            ) : (
              <>
                <div 
                  ref={mapContainer} 
                  className="w-full h-full"
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full md:w-1/3 h-auto md:h-[480px] p-4 md:p-5 flex flex-col justify-center bg-card">
            {activeData ? (
              <div 
                className="animate-in fade-in duration-200 p-4 rounded-lg"
                style={{
                  borderLeft: `4px solid ${activeData.color}`,
                  backgroundColor: `${activeData.color}10`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: activeData.color }}
                  />
                  <h3 className="text-xl font-bold">{activeData.name}</h3>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-3">{activeData.intro}</p>
                <p className="text-sm leading-relaxed">{activeData.description}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {neighborhoods.map((n) => (
                  <button
                    key={n.id}
                    className="w-full text-left px-3 py-2.5 rounded-md text-sm transition-all duration-150 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-muted"
                    onClick={() => handleClick(n.id)}
                    onMouseEnter={() => handleHover(n.id)}
                    onMouseLeave={() => handleHover(null)}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: n.color }}
                    />
                    <span>{n.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
