import { Skeleton } from "../ui/Skeleton";

export function RequestCardSkeleton() {
  return (
    <div className="flex items-center gap-3 glass-card p-4">
      <Skeleton className="h-12 w-12 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}
