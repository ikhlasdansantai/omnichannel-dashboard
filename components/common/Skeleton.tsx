import { cn } from "@/lib/utils";

const SPARK_HEIGHTS = [45, 30, 65, 50, 80, 40, 70, 55, 90, 35, 75, 60, 48, 85];
function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} style={style} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="flex flex-col gap-6 justify-between border bg-card p-4 py-6 rounded-lg">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-8 w-36" />
      <div className="h-px bg-border" />
      <div className="flex items-end gap-1.5 h-[200px] pt-4">
        {SPARK_HEIGHTS.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm rounded-b-none"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-5">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      <div className="pt-3 border-t flex justify-between">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b">
        <Skeleton className="h-8 flex-1 max-w-xs" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 flex flex-col items-center gap-4 text-center">
      <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="hsl(var(--destructive))" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Failed to load data</p>
        <p className="text-xs text-muted-foreground mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="text-xs px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors text-foreground"
      >
        Try again
      </button>
    </div>
  );
}
