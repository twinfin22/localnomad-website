"use client";

import dynamic from "next/dynamic";

const SeoulNeighborhoodMap = dynamic(
  () =>
    import("@/components/SeoulNeighborhoodMap").then((mod) => ({
      default: mod.SeoulNeighborhoodMap,
    })),
  {
    ssr: false,
    loading: () => (
      <section className="w-full py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-fluid-section font-bold text-center mb-4 text-primary text-balance">
            Choose Your Neighborhood
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto text-fluid-body">
            Explore Seoul&apos;s diverse neighborhoods and find the perfect
            place for your soft landing.
          </p>
          <div className="flex flex-col md:flex-row rounded-xl overflow-hidden border bg-card shadow-lg">
            <div className="w-full md:w-2/3 h-[320px] md:h-[480px] bg-muted animate-pulse" />
            <div className="w-full md:w-1/3 h-auto md:h-[480px] p-4 md:p-5 bg-card">
              <div className="space-y-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted/50 rounded-md animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
  }
);

export { SeoulNeighborhoodMap as LazySeoulNeighborhoodMap };
