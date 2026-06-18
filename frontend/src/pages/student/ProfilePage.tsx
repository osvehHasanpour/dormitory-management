import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { ProfilePanel } from '../../components/profile/ProfilePanel'

export function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-soft pb-32">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-heading-lg text-ink active:bg-primary/25 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
        <span className="pointer-events-none absolute left-4 top-5 h-4 w-4 border-l-2 border-t-2 border-primary/40 sm:left-6" />
        <span className="pointer-events-none absolute bottom-0 left-4 h-4 w-4 border-b-2 border-l-2 border-primary/40 sm:left-6" />
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">پروفایل</h1>
        </section>

        <ProfilePanel />
      </main>

      <BottomNav activeTab="profile" />
    </div>
  )
}
