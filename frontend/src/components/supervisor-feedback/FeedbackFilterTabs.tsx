import type { FeedbackFilterValue } from "../../types/supervisorFeedback";
import { feedbackFilterTabs } from "../../data/supervisorFeedbackItems";
import { ScrollableTabs } from "../ui/ScrollableTabs";

interface FeedbackFilterTabsProps {
  activeFilter: FeedbackFilterValue;
  onChange: (filter: FeedbackFilterValue) => void;
}

export function FeedbackFilterTabs({
  activeFilter,
  onChange,
}: FeedbackFilterTabsProps) {
  return (
    <ScrollableTabs
      tabs={feedbackFilterTabs}
      activeValue={activeFilter}
      onChange={onChange}
    />
  );
}
