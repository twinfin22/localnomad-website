export default function DashboardLoading() {
  return (
    <main className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-neutral-200" />
        </div>

        {/* D-Day card skeleton */}
        <div className="mt-8 h-32 animate-pulse rounded-lg border bg-white" />

        {/* Checklist rows skeleton */}
        <div className="mt-8 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex h-14 animate-pulse items-center gap-3 rounded-lg border bg-white px-4"
            >
              <div className="h-5 w-5 rounded bg-neutral-200" />
              <div className="h-4 flex-1 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
