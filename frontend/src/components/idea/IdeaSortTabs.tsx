import { ideaSortTabs } from '../../data/ideaItems'
import type { IdeaOrdering } from '../../types/idea'

interface IdeaSortTabsProps {
  activeOrdering: IdeaOrdering
  onChange: (ordering: IdeaOrdering) => void
}

export function IdeaSortTabs({ activeOrdering, onChange }: IdeaSortTabsProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-5 border-b border-hairline px-1">
        {ideaSortTabs.map((tab) => {
          const isActive = tab.value === activeOrdering

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`relative pb-3 text-caption-md font-bold transition-colors ${
                isActive ? 'text-ink' : 'text-mute hover:text-ink'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              {tab.label}
              {isActive ? (
                <span
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
