import { Skeleton } from "../ui/Skeleton";

export function IdeaCardSkeleton() {
  return (
    <div className="glass-card rounded-md border border-hairline p-4 shadow-elevated">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-9 w-20 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}
