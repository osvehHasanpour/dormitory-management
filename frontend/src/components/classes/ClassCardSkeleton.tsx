import { Skeleton } from "../ui/Skeleton";

export function ClassCardSkeleton() {
  return (
    <div className="glass-card space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}
