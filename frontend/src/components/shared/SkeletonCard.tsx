"use client";

type Props = {
  variant?: "default" | "compact" | "horizontal";
};

export function SkeletonCard({ variant = "default" }: Props) {
  if (variant === "horizontal") {
    return (
      <div className="flex overflow-hidden bg-white animate-pulse" style={{ borderRadius: 16, borderLeft: "3px solid #e5e7eb" }}>
        <div className="w-28 sm:w-36 bg-gray-200 min-h-[100px]" />
        <div className="p-3 sm:p-4 flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="overflow-hidden bg-white animate-pulse" style={{ borderRadius: 16, borderBottom: "2.5px solid #e5e7eb" }}>
        <div className="aspect-square bg-gray-200" />
        <div className="p-2.5 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white animate-pulse" style={{ borderRadius: 16, borderBottom: "2.5px solid #e5e7eb" }}>
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />)}
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded-full w-12" />
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        div :global(.animate-pulse) > div { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export function SkeletonGrid({ count = 4, variant = "default", columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" }: { count?: number; variant?: "default" | "compact" | "horizontal"; columns?: string }) {
  return (
    <div className={`grid ${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}
