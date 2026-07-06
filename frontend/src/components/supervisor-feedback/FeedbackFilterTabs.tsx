import type { FeedbackFilterValue } from "../../types/supervisorFeedback";
import { feedbackFilterTabs } from "../../data/supervisorFeedbackItems";

interface FeedbackFilterTabsProps {
  activeFilter: FeedbackFilterValue;
  onChange: (filter: FeedbackFilterValue) => void;
}

export function FeedbackFilterTabs({
  activeFilter,
  onChange,
}: FeedbackFilterTabsProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-5 border-b border-hairline px-1">
        {feedbackFilterTabs.map((tab) => {
          const isActive = tab.value === activeFilter;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`relative pb-3 text-caption-md font-bold transition-colors ${
                isActive ? "text-ink" : "text-mute hover:text-ink"
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              {tab.label}
              {isActive ? (
                <span
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
