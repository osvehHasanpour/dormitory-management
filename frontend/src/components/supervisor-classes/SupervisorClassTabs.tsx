import { supervisorClassTabs } from "../../data/supervisorClassItems";
import type { SupervisorClassTabValue } from "../../types/supervisorClass";
import { ScrollableTabs } from "../ui/ScrollableTabs";

interface SupervisorClassTabsProps {
  activeTab: SupervisorClassTabValue;
  onChange: (tab: SupervisorClassTabValue) => void;
}

export function SupervisorClassTabs({
  activeTab,
  onChange,
}: SupervisorClassTabsProps) {
  return (
    <ScrollableTabs
      tabs={supervisorClassTabs}
      activeValue={activeTab}
      onChange={onChange}
    />
  );
}
