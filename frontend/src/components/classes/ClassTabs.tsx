import type { ClassesTabValue } from "../../types/class";
import { ScrollableTabs } from "../ui/ScrollableTabs";

interface ClassTabsProps {
  activeTab: ClassesTabValue;
  onChange: (tab: ClassesTabValue) => void;
}

const tabs: Array<{ value: ClassesTabValue; label: string }> = [
  { value: "active", label: "فعال" },
  { value: "enrolled", label: "ثبت‌نام شده" },
  { value: "ended", label: "پایان یافته" },
];

export function ClassTabs({ activeTab, onChange }: ClassTabsProps) {
  return (
    <ScrollableTabs tabs={tabs} activeValue={activeTab} onChange={onChange} />
  );
}
