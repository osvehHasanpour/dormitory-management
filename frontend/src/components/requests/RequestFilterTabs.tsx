import type { MyRequestsTab } from "../../types/request";
import { requestFilterTabs } from "../../data/requestItems";
import { ScrollableTabs } from "../ui/ScrollableTabs";

interface RequestFilterTabsProps {
  activeFilter: MyRequestsTab;
  onChange: (filter: MyRequestsTab) => void;
}

export function RequestFilterTabs({
  activeFilter,
  onChange,
}: RequestFilterTabsProps) {
  return (
    <ScrollableTabs
      tabs={requestFilterTabs}
      activeValue={activeFilter}
      onChange={onChange}
    />
  );
}
