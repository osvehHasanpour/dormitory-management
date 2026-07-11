import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { FeedbackCard } from "../../components/supervisor-feedback/FeedbackCard";
import { FeedbackCardSkeleton } from "../../components/supervisor-feedback/FeedbackCardSkeleton";
import { FeedbackDetailSheet } from "../../components/supervisor-feedback/FeedbackDetailSheet";
import { FeedbackEmptyState } from "../../components/supervisor-feedback/FeedbackEmptyState";
import { FeedbackFilterTabs } from "../../components/supervisor-feedback/FeedbackFilterTabs";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Toast } from "../../components/ui/Toast";
import {
  feedbackFilterTabs,
  getFeedbackTypeBadgeConfig,
} from "../../data/supervisorFeedbackItems";
import { useSupervisorFeedbackDetail } from "../../hooks/useSupervisorFeedbackDetail";
import { useSupervisorFeedbackFeed } from "../../hooks/useSupervisorFeedbackFeed";
import { useSupervisorFeedbackResponse } from "../../hooks/useSupervisorFeedbackResponse";

export function SupervisorIdeasComplaintsPage() {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    retry,
    updateItem,
  } = useSupervisorFeedbackFeed();

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
  } = useSupervisorFeedbackDetail();

  const handleFeedbackUpdated = (updated: Parameters<typeof updateItem>[0]) => {
    updateItem(updated);
    setDetail(updated);
  };

  const {
    form,
    isSubmitting,
    toastMessage,
    clearMessages,
    applyStatusAction,
    approveIdea,
    rejectIdea,
  } = useSupervisorFeedbackResponse({ onSuccess: handleFeedbackUpdated });

  const handleCloseDetail = () => {
    clearMessages();
    closeDetail();
  };

  const displaySource = detail ?? preview;
  const activeTabLabel =
    feedbackFilterTabs.find((tab) => tab.value === activeFilter)?.label ??
    "همه";

  return (
    <PageShell>
      <PageHeader
        breadcrumb="مدیریت ایده‌ها و شکایات"
        onBack={() => navigate(-1)}
      />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">ایده‌ها و شکایات</h1>
          <p className="mt-2 text-body-sm text-mute">مشاهده و پاسخگویی</p>
        </section>

        <FeedbackFilterTabs
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        <section className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <FeedbackCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && items.length === 0 ? (
            <div className="md:col-span-2">
              <FeedbackEmptyState filterLabel={activeTabLabel} />
            </div>
          ) : null}

          {!isLoading && !error
            ? items.map((item) => (
                <FeedbackCard key={item.id} item={item} onClick={openDetail} />
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
        title={displaySource?.title ?? "جزئیات"}
        subtitle={
          displaySource
            ? getFeedbackTypeBadgeConfig(displaySource.type).label
            : null
        }
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
            const source = detail ?? preview;
            if (source) {
              void applyStatusAction(source, action);
            }
          }}
          onApproveIdea={() => {
            const source = detail ?? preview;
            if (source) {
              void approveIdea(source);
            }
          }}
          onRejectIdea={() => {
            const source = detail ?? preview;
            if (source) {
              void rejectIdea(source);
            }
          }}
        />
      </BottomSheet>

      <BottomNav variant="supervisor" activeTab="home" />
    </PageShell>
  );
}
