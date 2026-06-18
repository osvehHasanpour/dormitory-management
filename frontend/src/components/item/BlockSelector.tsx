import { itemBlocks } from '../../types/item'

interface BlockSelectorProps {
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function BlockSelector({ value, error, onChange, onBlur }: BlockSelectorProps) {
  return (
    <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
      <span className="mb-3 flex items-center gap-2 text-body-sm-strong text-ink">
        <span aria-hidden="true">ساختمان</span>
        انتخاب بلوک
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
      >
        <option value="">انتخاب بلوک</option>
        {itemBlocks.map((block) => (
          <option key={block.value} value={block.label}>
            {block.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-body-sm text-error">{error}</p> : null}
    </label>
  )
}
