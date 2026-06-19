import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { RequestCard } from '../../components/requests/RequestCard'
import { RequestCardSkeleton } from '../../components/requests/RequestCardSkeleton'
import { RequestDetailSheet } from '../../components/requests/RequestDetailSheet'
import { RequestEmptyState } from '../../components/requests/RequestEmptyState'
import { RequestFilterTabs } from '../../components/requests/RequestFilterTabs'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Toast } from '../../components/ui/Toast'
import { getRequestTypeConfig } from '../../data/requestItems'
import { useMyRequests } from '../../hooks/useMyRequests'
import { useRequestDetail } from '../../hooks/useRequestDetail'

export function MyRequestsPage() {
  const navigate = useNavigate()
  const { requests, isLoading, error, activeFilter, setActiveFilter, retry } = useMyRequests()
  const {
    detail,
    isLoading: isDetailLoading,
    error: detailError,
    selectedId,
    openDetail,
    closeDetail,
    retry: retryDetail,
  } = useRequestDetail()

  const sheetTitle =
    detail != null
      ? getRequestTypeConfig(detail.request_type).label
      : selectedId != null
        ? 'جزئیات درخواست'
        : 'جزئیات درخواست'

  return (
    <div className="min-h-screen bg-surface-soft pb-28">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6 md:max-w-3xl lg:max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-heading-lg text-ink active:bg-primary/25 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6 md:max-w-3xl lg:max-w-5xl">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">درخواست‌های من</h1>
        </section>

        <RequestFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

        <section className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <RequestCardSkeleton key={index} />)
            : null}

          {!isLoading && !error && requests.length === 0 ? (
            <div className="md:col-span-2">
              <RequestEmptyState />
            </div>
          ) : null}

          {!isLoading && !error
            ? requests.map((request) => (
                <RequestCard key={request.id} request={request} onClick={openDetail} />
              ))
            : null}
        </section>
      </main>

      {error ? <Toast message={error} onRetry={retry} /> : null}
      {detailError ? <Toast message={detailError} onRetry={retryDetail} /> : null}

      <BottomSheet
        isOpen={selectedId !== null}
        onClose={closeDetail}
        title={sheetTitle}
      >
        <RequestDetailSheet request={detail} isLoading={isDetailLoading} />
      </BottomSheet>

      <BottomNav activeTab="requests" />
    </div>
  )
}
