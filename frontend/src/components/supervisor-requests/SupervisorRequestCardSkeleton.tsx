import { Skeleton } from '../ui/Skeleton'

export function SupervisorRequestCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 glass-card p-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}
