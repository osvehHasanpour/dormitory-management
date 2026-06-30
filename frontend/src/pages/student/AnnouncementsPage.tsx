import { useNavigate } from 'react-router-dom'

import { AnnouncementCard } from '../../components/announcement/AnnouncementCard'
import { AnnouncementCardSkeleton } from '../../components/announcement/AnnouncementCardSkeleton'
import { AnnouncementsEmptyState } from '../../components/announcement/AnnouncementsEmptyState'
import { BottomNav } from '../../components/layout/BottomNav'
import { Toast } from '../../components/ui/Toast'
import { useAnnouncementsFeed } from '../../hooks/useAnnouncementsFeed'

export function AnnouncementsPage() {
  const navigate = useNavigate()
  const { announcements, isLoading, error, retry } = useAnnouncementsFeed()

  return (
    <div className="page-gradient min-h-screen pb-28">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-heading-lg text-ink backdrop-blur-sm active:bg-white/45 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">لیست اطلاعیه‌ها</h1>
        </section>

        <section className="space-y-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <AnnouncementCardSkeleton key={index} />)
            : null}

          {!isLoading && !error && announcements.length === 0 ? <AnnouncementsEmptyState /> : null}

          {!isLoading && !error
            ? announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))
            : null}
        </section>
      </main>

      {error ? <Toast message={error} onRetry={retry} /> : null}

      <BottomNav activeTab="home" />
    </div>
  )
}
