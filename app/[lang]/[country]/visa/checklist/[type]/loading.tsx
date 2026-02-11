import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
      {/* Checklist detail skeleton */}
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-10 w-72 mb-2" />
        <Skeleton className="h-5 w-full max-w-lg mb-8" />
        {/* Progress bar */}
        <Skeleton className="h-3 w-full rounded-full mb-8" />
        {/* Checklist items */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 border border-border rounded-lg">
              <Skeleton className="h-5 w-5 rounded mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
