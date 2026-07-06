import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { FeedbackCard } from '../../components/supervisor-feedback/FeedbackCard'
import { FeedbackCardSkeleton } from '../../components/supervisor-feedback/FeedbackCardSkeleton'
import { FeedbackDetailSheet } from '../../components/supervisor-feedback/FeedbackDetailSheet'
import { FeedbackEmptyState } from '../../components/supervisor-feedback/FeedbackEmptyState'
import { FeedbackFilterTabs } from '../../components/supervisor-feedback/FeedbackFilterTabs'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Toast } from '../../components/ui/Toast'
import { feedbackFilterTabs } from '../../data/supervisorFeedbackItems'
import { useSupervisorFeedbackDetail } from '../../hooks/useSupervisorFeedbackDetail'
import { useSupervisorFeedbackFeed } from '../../hooks/useSupervisorFeedbackFeed'
import { useSupervisorFeedbackResponse } from '../../hooks/useSupervisorFeedbackResponse'

export function SupervisorIdeasComplaintsPage() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    retry,
    updateItem,
  } = useSupervisorFeedbackFeed()

  const {
    detail,
    preview,
    isLoading: isDetailLoading,
    error: detailError,
    selectedId,
    openDetail,
    closeDetail,
    retry: retryDetail,
    setDetail,
  } = useSupervisorFeedbackDetail()

  const handleFeedbackUpdated = (updated: Parameters<typeof updateItem>[0]) => {
    updateItem(updated)
    setDetail(updated)
  }

  const {
    form,
    isSubmitting,
    toastMessage,
    clearMessages,
    applyStatusAction,
    approveIdea,
    rejectIdea,
  } = useSupervisorFeedbackResponse({ onSuccess: handleFeedbackUpdated })

  const displaySource = detail ?? preview
  const activeTabLabel =
    feedbackFilterTabs.find((tab) => tab.value === activeFilter)?.label ?? 'همه'

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
          <h1 className="text-heading-xl text-ink">ایده‌ها و شکایات</h1>
          <p className="mt-2 text-body-sm text-mute">مشاهده و پاسخگویی</p>
        </section>

        <FeedbackFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

        <section className="mt-6 space-y-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <FeedbackCardSkeleton key={index} />)
            : null}

          {!isLoading && !error && items.length === 0 ? (
            <FeedbackEmptyState filterLabel={activeTabLabel} />
          ) : null}

          {!isLoading && !error
            ? items.map((item) => (
                <FeedbackCard key={item.id} item={item} onClick={openDetail} />
              ))
            : null}
        </section>
      </main>

      {error ? <Toast message={error} onRetry={retry} /> : null}
      {detailError ? <Toast message={detailError} onRetry={retryDetail} /> : null}

      <BottomSheet
        isOpen={selectedId !== null}
        onClose={closeDetail}
        title={displaySource?.title ?? 'جزئیات'}
        subtitle={displaySource ? displaySource.type_display : null}
      >
        <FeedbackDetailSheet
          item={detail}
          preview={preview}
          isLoading={isDetailLoading}
          error={detailError}
          isSubmitting={isSubmitting}
          toastMessage={toastMessage}
          form={form}
          onRetry={retryDetail}
          onClearMessages={clearMessages}
          onStatusAction={(action) => {
            const source = detail ?? preview
            if (source) {
              void applyStatusAction(source, action)
            }
          }}
          onApproveIdea={() => {
            const source = detail ?? preview
            if (source) {
              void approveIdea(source)
            }
          }}
          onRejectIdea={() => {
            const source = detail ?? preview
            if (source) {
              void rejectIdea(source)
            }
          }}
        />
      </BottomSheet>

      <BottomNav variant="supervisor" activeTab="home" />
    </div>
  )
}
