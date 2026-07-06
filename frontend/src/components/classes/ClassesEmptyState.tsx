import type { ClassesTabValue } from '../../types/class'

interface ClassesEmptyStateProps {
  tab: ClassesTabValue
}

const emptyMessages: Record<ClassesTabValue, string> = {
  active: 'در حال حاضر کلاسی برای ثبت‌نام وجود ندارد.',
  enrolled: 'شما هنوز در هیچ کلاس فعالی ثبت‌نام نکرده‌اید.',
  ended: 'هیچ کلاس پایان‌یافته‌ای برای نمایش وجود ندارد.',
}

export function ClassesEmptyState({ tab }: ClassesEmptyStateProps) {
  return (
    <div className="glass-card border-dashed px-6 py-10 text-center">
      <p className="text-heading-md text-ink">کلاس خالی است</p>
      <p className="mt-2 text-body-sm text-body-text">{emptyMessages[tab]}</p>
    </div>
  )
}
