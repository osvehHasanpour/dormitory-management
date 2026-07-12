import { maintenanceCategories } from "../../types/maintenance";
import { ResponsiveDropdown } from "../ui/ResponsiveDropdown";

interface CategorySelectorProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function CategorySelector({
  value,
  error,
  onChange,
  onBlur,
}: CategorySelectorProps) {
  return (
    <label className="block glass-card p-4">
      <span className="mb-3 block text-body-sm-strong text-ink">
        دسته‌بندی خرابی
      </span>
      <ResponsiveDropdown
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        options={maintenanceCategories}
        placeholder="انتخاب دسته‌بندی"
        panelTitle="دسته‌بندی خرابی"
      />
      {error ? <p className="mt-2 text-body-sm text-error">{error}</p> : null}
    </label>
  );
}
