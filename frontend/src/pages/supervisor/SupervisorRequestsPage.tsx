import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
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

  const handleCloseDetail = () => {
    clearMessages();
    closeDetail();
  };

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
    <PageShell>
      <PageHeader
        breadcrumb="داشبورد درخواست‌ها"
        onBack={() => navigate(-1)}
      />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">درخواست‌های خوابگاه</h1>
        </section>

        <SupervisorRequestTabs
          activeType={activeType}
          onChange={setActiveType}
        />

        <section className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <SupervisorRequestCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && items.length === 0 ? (
            <div className="md:col-span-2">
              <SupervisorRequestEmptyState filterLabel={activeTabLabel} />
            </div>
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
      </ContentContainer>

      {error ? <Toast message={error} onRetry={retry} /> : null}
      {detailError ? (
        <Toast message={detailError} onRetry={retryDetail} />
      ) : null}

      <BottomSheet
        isOpen={selectedId !== null}
        onClose={handleCloseDetail}
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
    </PageShell>
  );
}
