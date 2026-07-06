import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { RequestCard } from "../../components/requests/RequestCard";
import { RequestCardSkeleton } from "../../components/requests/RequestCardSkeleton";
import { RequestDetailSheet } from "../../components/requests/RequestDetailSheet";
import { RequestEmptyState } from "../../components/requests/RequestEmptyState";
import { RequestFilterTabs } from "../../components/requests/RequestFilterTabs";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Toast } from "../../components/ui/Toast";
import { useMyRequests } from "../../hooks/useMyRequests";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import {
  getRequestDetailTitle,
  getRequestDetailSubtitle,
} from "../../utils/requestHelpers";

export function MyRequestsPage() {
  const navigate = useNavigate();
  const { requests, isLoading, error, activeFilter, setActiveFilter, retry } =
    useMyRequests();
  const {
    detail,
    preview,
    isLoading: isDetailLoading,
    error: detailError,
    selectedId,
    openDetail,
    closeDetail,
    retry: retryDetail,
  } = useRequestDetail();

  const displaySource = detail ?? preview;
  const sheetTitle = displaySource
    ? getRequestDetailTitle(displaySource)
    : "جزئیات درخواست";
  const sheetSubtitle = displaySource
    ? getRequestDetailSubtitle(displaySource)
    : null;

  return (
    <div className="page-gradient min-h-screen pb-28">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6 md:max-w-3xl lg:max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-heading-lg text-ink backdrop-blur-sm active:bg-white/45 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6 md:max-w-3xl lg:max-w-5xl">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">درخواست‌های من</h1>
        </section>

        <RequestFilterTabs
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        <section className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <RequestCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && requests.length === 0 ? (
            <div className="md:col-span-2">
              <RequestEmptyState />
            </div>
          ) : null}

          {!isLoading && !error
            ? requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={openDetail}
                />
              ))
            : null}
        </section>
      </main>

      {error ? <Toast message={error} onRetry={retry} /> : null}
      {detailError ? (
        <Toast message={detailError} onRetry={retryDetail} />
      ) : null}

      <BottomSheet
        isOpen={selectedId !== null}
        onClose={closeDetail}
        title={sheetTitle}
        subtitle={sheetSubtitle}
      >
        <RequestDetailSheet
          request={detail}
          preview={preview}
          isLoading={isDetailLoading}
          error={detailError}
          onRetry={retryDetail}
        />
      </BottomSheet>

      <BottomNav activeTab="requests" />
    </div>
  );
}
