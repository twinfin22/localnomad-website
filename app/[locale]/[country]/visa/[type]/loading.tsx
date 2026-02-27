export default function VisaDetailLoading() {
  return (
    <main className="min-h-svh bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Back link skeleton */}
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />

        {/* Title skeleton */}
        <div className="mt-6 h-9 w-72 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-5 w-96 animate-pulse rounded bg-neutral-200" />

        {/* Summary cards skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border bg-white"
            />
          ))}
        </div>

        {/* Document rows skeleton */}
        <div className="mt-12 space-y-2">
          <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-neutral-200" />
          <div className="mt-6 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
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
      </div>
    </main>
  );
}
