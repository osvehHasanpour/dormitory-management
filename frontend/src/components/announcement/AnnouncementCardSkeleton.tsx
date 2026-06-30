import { Skeleton } from '../ui/Skeleton'

export function AnnouncementCardSkeleton() {
  return (
    <div className="glass-card rounded-md border border-hairline p-4 shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}
