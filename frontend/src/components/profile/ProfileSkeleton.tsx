const SKELETON_ROWS = 4

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="در حال بارگذاری پروفایل">
      <div className="mx-auto mb-4 h-28 w-28 animate-pulse rounded-full bg-surface-card" />
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-md border border-hairline bg-canvas p-4 shadow-elevated"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-surface-card" />
          <div className="flex-1">
            <div className="h-4 w-28 rounded-md bg-surface-card" />
            <div className="mt-3 h-5 w-40 rounded-md bg-surface-card" />
          </div>
        </div>
      ))}
    </div>
  )
}
