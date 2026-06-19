import type { LucideIcon } from 'lucide-react'

interface ProfileInfoItem {
  icon: LucideIcon
  label: string
  value: string
}

interface ProfileInfoListProps {
  items: ProfileInfoItem[]
}

export function ProfileInfoList({ items }: ProfileInfoListProps) {
  return (
    <div className="glass-card overflow-hidden">
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <div key={item.label}>
            <div className="flex items-center gap-4 px-4 py-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/30"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>

              <div className="min-w-0 flex-1 text-right">
                <p className="text-body-sm text-body-text">{item.label}</p>
                <p className="mt-0.5 text-body-md text-ink">{item.value}</p>
              </div>
            </div>

            {index < items.length - 1 ? <div className="glass-divider" /> : null}
          </div>
        )
      })}
    </div>
  )
}
