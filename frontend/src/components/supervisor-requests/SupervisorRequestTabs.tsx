import type { RequestType } from "../../types/request";
import { supervisorRequestTabs } from "../../data/supervisorRequestItems";
import { ScrollableTabs } from "../ui/ScrollableTabs";

interface SupervisorRequestTabsProps {
  activeType: RequestType;
  onChange: (type: RequestType) => void;
}

export function SupervisorRequestTabs({
  activeType,
  onChange,
}: SupervisorRequestTabsProps) {
  return (
    <ScrollableTabs
      tabs={supervisorRequestTabs}
      activeValue={activeType}
      onChange={onChange}
      renderTab={(tab, isActive) => (
        <button
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.value)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-button-sm transition-colors ${
            isActive
              ? "bg-primary text-on-primary"
              : "bg-surface-card text-ink hover:bg-primary/20"
          }`}
        >
          {tab.label}
        </button>
      )}
    />
  );
}
