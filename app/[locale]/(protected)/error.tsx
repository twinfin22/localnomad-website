'use client';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-neutral-50">
      <div className="mx-auto max-w-md px-6 text-center">
        <h1 className="font-lora text-2xl font-bold text-primary">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t load your dashboard. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
