import { maintenanceCategories } from '../../types/maintenance'

interface CategorySelectorProps {
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function CategorySelector({ value, error, onChange, onBlur }: CategorySelectorProps) {
  return (
    <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
      <span className="mb-3 block text-body-sm-strong text-ink">دسته‌بندی خرابی</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
      >
        <option value="">انتخاب دسته‌بندی</option>
        {maintenanceCategories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-body-sm text-error">{error}</p> : null}
    </label>
  )
}
