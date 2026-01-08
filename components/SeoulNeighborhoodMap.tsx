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
  },
  {
    id: "junggu",
    name: "Jung-gu",
    intro: "Historic core",
    description: "Seoul's historic core — government offices, old streets, and quiet routines.",
    lng: 126.9975,
    lat: 37.5636,
    color: "#8B7355",
  },
  {
    id: "gangnam",
    name: "Gangnam",
    intro: "Tech & startups",
    description: "Tech, startups, and fast-moving city life with global connections.",
    lng: 127.0276,
    lat: 37.4979,
    color: "#5C6BC0",
  },
  {
    id: "itaewon",
    name: "Itaewon",
    intro: "International district",
    description: "The most international part of Seoul — diverse, flexible, and culturally open.",
    lng: 126.9942,
    lat: 37.5345,
    color: "#E57373",
  },
  {
    id: "mapo",
    name: "Mapo (Hongdae / Yeonnam)",
    intro: "Creative & youthful",
    description: "Creative, youthful, and walkable — cafés, freelancers, and late nights.",
    lng: 126.9236,
    lat: 37.5566,
    color: "#FFB74D",
  },
  {
    id: "jongno",
    name: "Jongno",
    intro: "Traditional Seoul",
    description: "Traditional Seoul with deep history, markets, and administrative offices.",
    lng: 126.9920,
    lat: 37.5729,
    color: "#81C784",
  },
  {
    id: "seongsu",
    name: "Seongsu",
    intro: "Industrial-creative",
    description: "Industrial-turned-creative — studios, cafés, and modern urban culture.",
    lng: 127.0558,
    lat: 37.5446,
    color: "#BA68C8",
  },
  {
    id: "songpa",
    name: "Songpa (Jamsil)",
    intro: "Family-oriented",
    description: "Clean, spacious, and family-oriented with parks and newer housing.",
    lng: 127.1058,
    lat: 37.5145,
    color: "#4DB6AC",
  },
  {
    id: "hannam",
    name: "Hannam",
    intro: "Quiet luxury",
    description: "Quiet luxury, embassies, and curated living — discreet and international.",
    lng: 127.0048,
    lat: 37.5340,
    color: "#7986CB",
  },
];

const seoulBounds: [[number, number], [number, number]] = [
  [126.75, 37.40],
  [127.20, 37.70],
];

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
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
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
            
            return (
              <button
                key={n.id}
                className={`
                  absolute transform -translate-x-1/2 -translate-y-1/2
                  rounded-full transition-all duration-200 cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-primary/50
                  ${isActive ? "w-6 h-6 z-10" : "w-4 h-4"}
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: n.color,
                  boxShadow: isActive
                    ? `0 0 0 4px ${n.color}40, 0 0 16px ${n.color}60`
                    : `0 0 0 2px ${n.color}30, 0 2px 4px rgba(0,0,0,0.2)`,
                  filter: isActive ? "brightness(1.2)" : "brightness(1)",
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
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [highlightPulse, setHighlightPulse] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const hasToken = Boolean(token && token.length > 0);

  const handleNeighborhoodChange = useCallback((id: string | null) => {
    setActiveNeighborhood(id);
    if (id) {
      setHighlightPulse(true);
      setTimeout(() => setHighlightPulse(false), 300);
    }
  }, []);

  const handleMarkerHover = useCallback((id: string | null) => {
    handleNeighborhoodChange(id);
  }, [handleNeighborhoodChange]);

  const handleMarkerClick = useCallback((id: string) => {
    handleNeighborhoodChange(id);
  }, [handleNeighborhoodChange]);

  useEffect(() => {
    if (!hasToken || !mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = token!;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [126.9780, 37.5665],
        zoom: 11.5,
        maxBounds: seoulBounds,
        pitchWithRotate: false,
        dragRotate: false,
        touchPitch: false,
        failIfMajorPerformanceCaveat: false,
      });

      map.current = mapInstance;

      mapInstance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      mapInstance.on("load", () => {
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

    return () => {
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
      map.current?.remove();
      map.current = null;
    };
  }, [hasToken, token]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    neighborhoods.forEach((neighborhood) => {
      const el = document.createElement("div");
      el.className = "neighborhood-marker";
      
      const root = document.createElement("div");
      el.appendChild(root);

      const isActive = activeNeighborhood === neighborhood.id;
      
      root.style.cssText = `
        cursor: pointer;
        transition: all 0.2s ease-out;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${isActive ? "24px" : "16px"};
        height: ${isActive ? "24px" : "16px"};
        background-color: ${neighborhood.color};
        box-shadow: ${isActive
          ? `0 0 0 4px ${neighborhood.color}40, 0 0 16px ${neighborhood.color}60`
          : `0 0 0 2px ${neighborhood.color}30, 0 2px 4px rgba(0,0,0,0.2)`};
        filter: ${isActive ? "brightness(1.2)" : "brightness(1)"};
        transform: ${isActive ? "scale(1.1)" : "scale(1)"};
      `;

      el.addEventListener("mouseenter", () => handleMarkerHover(neighborhood.id));
      el.addEventListener("mouseleave", () => handleMarkerHover(null));
      el.addEventListener("click", () => handleMarkerClick(neighborhood.id));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([neighborhood.lng, neighborhood.lat])
        .addTo(map.current!);

      markersRef.current[neighborhood.id] = marker;
    });
  }, [mapLoaded, activeNeighborhood, handleMarkerHover, handleMarkerClick]);

  const activeData = neighborhoods.find((n) => n.id === activeNeighborhood);
  const showStaticFallback = !hasToken || mapError;

  return (
    <section className="w-full py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
          Choose Your Neighborhood
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Explore Seoul&apos;s diverse neighborhoods and find the perfect place for your soft landing.
        </p>

        <div className="flex flex-col md:flex-row gap-6 rounded-xl overflow-hidden border bg-card shadow-lg">
          {/* Map container - LEFT on desktop, TOP on mobile */}
          <div className="w-full md:w-2/3 h-[350px] md:h-[520px] relative bg-slate-100 rounded-xl overflow-hidden">
            {showStaticFallback ? (
              <StaticMapFallback
                activeNeighborhood={activeNeighborhood}
                onHover={handleMarkerHover}
                onClick={handleMarkerClick}
              />
            ) : (
              <>
                <div 
                  ref={mapContainer} 
                  className="w-full h-full rounded-xl overflow-hidden"
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info panel - RIGHT on desktop, BOTTOM on mobile */}
          <div className="w-full md:w-1/3 p-6 flex flex-col">
            <p className="text-xs text-muted-foreground mb-4 italic">
              Hover over markers on the map to explore neighborhoods.
            </p>

            <div
              className={`
                flex-1 rounded-lg border p-4 mb-4 transition-all duration-300 min-h-[120px]
                ${highlightPulse ? "ring-2 ring-primary/30 bg-primary/5" : "bg-background"}
              `}
              style={{
                borderTopColor: activeData?.color || "transparent",
                borderTopWidth: activeData ? "3px" : "1px",
              }}
            >
              {activeData ? (
                <div className="animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activeData.color }}
                    />
                    <h3 className="text-lg font-semibold">{activeData.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activeData.intro}</p>
                  <p className="text-sm">{activeData.description}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Hover a marker on the map to see details
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">All neighborhoods:</p>
              {neighborhoods.map((n) => (
                <button
                  key={n.id}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-150
                    flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50
                    ${activeNeighborhood === n.id 
                      ? "bg-primary/10 font-medium" 
                      : "hover:bg-muted"
                    }
                  `}
                  onClick={() => handleMarkerClick(n.id)}
                >
                  <span
                    className={`
                      rounded-full transition-all duration-150
                      ${activeNeighborhood === n.id ? "w-3 h-3" : "w-2 h-2"}
                    `}
                    style={{ backgroundColor: n.color }}
                  />
                  <span>{n.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
