import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { MaintenanceReportForm } from '../../components/maintenance/MaintenanceReportForm'

export function MaintenanceReportPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-soft pb-28">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-heading-lg text-ink active:bg-primary/25 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
        <span
          className="mt-2 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20"
          aria-label="اعلان جدید"
        />
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">گزارش خرابی</h1>
          <p className="mt-2 text-heading-lg text-mute">ثبت درخواست خرابی</p>
        </section>

        <MaintenanceReportForm />
      </main>

      <BottomNav activeTab="home" />
    </div>
  )
}
