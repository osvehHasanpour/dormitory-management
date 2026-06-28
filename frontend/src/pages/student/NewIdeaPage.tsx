import newIdeaHero from '@media/idea.png'
import { useNavigate } from 'react-router-dom'

import { IdeaRequestForm } from '../../components/idea/IdeaRequestForm'
import { BottomNav } from '../../components/layout/BottomNav'

export function NewIdeaPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface-soft pb-32">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas text-heading-lg text-ink shadow-elevated active:bg-surface-card sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-heading-xl text-ink">ثبت ایده جدید</h1>
          <img
            src={newIdeaHero}
            alt="تصویر ثبت ایده جدید"
            className="mt-5 h-28 w-28 rounded-full border border-hairline bg-canvas object-cover p-1 shadow-elevated"
          />
          <p className="mt-4 max-w-xs text-body-md text-mute">
            ما منتظر ایده‌ها و نظرات سازنده شما هستیم.
          </p>
        </section>

        <IdeaRequestForm />
      </main>

      <BottomNav activeTab="home" />
    </div>
  )
}
