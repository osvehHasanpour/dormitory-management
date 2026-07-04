import type { RequestType } from '../../types/request'
import { supervisorRequestTabs } from '../../data/supervisorRequestItems'

interface SupervisorRequestTabsProps {
  activeType: RequestType
  onChange: (type: RequestType) => void
}

export function SupervisorRequestTabs({ activeType, onChange }: SupervisorRequestTabsProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {supervisorRequestTabs.map((tab) => {
          const isActive = tab.value === activeType

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`rounded-full px-3.5 py-1.5 text-button-sm transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-card text-ink hover:bg-primary/20'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
