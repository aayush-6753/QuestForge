export function LoadingSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-vellum/10 bg-coal/90 p-6 shadow-glow">
        <p className="font-display text-lg text-vellum">{label}</p>
        <div className="mt-5 space-y-3" aria-hidden="true">
          <div className="h-3 animate-pulse rounded bg-parchment/20" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-parchment/15" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-parchment/10" />
        </div>
      </div>
    </div>
  );
}
