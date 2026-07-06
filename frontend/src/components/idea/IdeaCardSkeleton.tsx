import { Skeleton } from '../ui/Skeleton'

export function IdeaCardSkeleton() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </div>
  )
}
