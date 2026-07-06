import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { SupervisorRequestCard } from "../../components/supervisor-requests/SupervisorRequestCard";
import { SupervisorRequestCardSkeleton } from "../../components/supervisor-requests/SupervisorRequestCardSkeleton";
import { SupervisorRequestDetailSheet } from "../../components/supervisor-requests/SupervisorRequestDetailSheet";
import { SupervisorRequestEmptyState } from "../../components/supervisor-requests/SupervisorRequestEmptyState";
import { SupervisorRequestTabs } from "../../components/supervisor-requests/SupervisorRequestTabs";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Toast } from "../../components/ui/Toast";
import { supervisorRequestTabs } from "../../data/supervisorRequestItems";
import { useSupervisorRequestDetail } from "../../hooks/useSupervisorRequestDetail";
import { useSupervisorRequestUpdate } from "../../hooks/useSupervisorRequestUpdate";
import { useSupervisorRequestsFeed } from "../../hooks/useSupervisorRequestsFeed";
import {
  getRequestDetailSubtitle,
  getRequestDetailTitle,
} from "../../utils/requestHelpers";
import type { StudentRequestDetail } from "../../types/request";

export function SupervisorRequestsPage() {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    error,
    activeType,
    setActiveType,
    retry,
    updateItem,
  } = useSupervisorRequestsFeed();

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
  } = useSupervisorRequestDetail();

  const handleRequestUpdated = (updated: StudentRequestDetail) => {
    updateItem(updated);
    setDetail(updated);
  };

  const { form, isSubmitting, toastMessage, clearMessages, submit } =
    useSupervisorRequestUpdate({ onSuccess: handleRequestUpdated });

  const displaySource = detail ?? preview;
  const sheetTitle = displaySource
    ? getRequestDetailTitle(displaySource)
    : "جزئیات درخواست";
  const sheetSubtitle = displaySource
    ? getRequestDetailSubtitle(displaySource)
    : null;
  const activeTabLabel =
    supervisorRequestTabs.find((tab) => tab.value === activeType)?.label ?? "";

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
        <span className="inline-flex rounded-full bg-surface-card px-4 py-1.5 text-caption-md font-medium text-ink">
          داشبورد درخواست‌ها
        </span>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">درخواست‌های خوابگاه</h1>
        </section>

        <SupervisorRequestTabs
          activeType={activeType}
          onChange={setActiveType}
        />

        <section className="mt-6 space-y-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <SupervisorRequestCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && items.length === 0 ? (
            <SupervisorRequestEmptyState filterLabel={activeTabLabel} />
          ) : null}

          {!isLoading && !error
            ? items.map((request) => (
                <SupervisorRequestCard
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
        <SupervisorRequestDetailSheet
          request={detail}
          preview={preview}
          isLoading={isDetailLoading}
          error={detailError}
          isSubmitting={isSubmitting}
          toastMessage={toastMessage}
          form={form}
          onRetry={retryDetail}
          onClearMessages={clearMessages}
          onSubmit={() => {
            const source = detail ?? preview;
            if (source) {
              void submit(source);
            }
          }}
        />
      </BottomSheet>

      <BottomNav variant="supervisor" activeTab="home" />
    </div>
  );
}
