import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { ComplaintCard } from "../../components/requests/ComplaintCard";
import { ComplaintDetailSheet } from "../../components/requests/ComplaintDetailSheet";
import { RequestCard } from "../../components/requests/RequestCard";
import { RequestCardSkeleton } from "../../components/requests/RequestCardSkeleton";
import { RequestDetailSheet } from "../../components/requests/RequestDetailSheet";
import { RequestEmptyState } from "../../components/requests/RequestEmptyState";
import { RequestFilterTabs } from "../../components/requests/RequestFilterTabs";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Toast } from "../../components/ui/Toast";
import { useComplaintDetail } from "../../hooks/useComplaintDetail";
import { useMyComplaints } from "../../hooks/useMyComplaints";
import { useMyRequests } from "../../hooks/useMyRequests";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import type { MyRequestsTab } from "../../types/request";
import {
  getRequestDetailTitle,
  getRequestDetailSubtitle,
} from "../../utils/requestHelpers";

export function MyRequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MyRequestsTab>("all");
  const isComplaintsTab = activeTab === "complaints";

  const { requests, isLoading, error, setActiveFilter, retry } =
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

  const {
    complaints,
    isLoading: isComplaintsLoading,
    error: complaintsError,
    retry: retryComplaints,
  } = useMyComplaints();
  const {
    detail: complaintDetail,
    preview: complaintPreview,
    isLoading: isComplaintDetailLoading,
    error: complaintDetailError,
    selectedId: complaintSelectedId,
    openDetail: openComplaintDetail,
    closeDetail: closeComplaintDetail,
    retry: retryComplaintDetail,
  } = useComplaintDetail();

  const handleTabChange = (tab: MyRequestsTab) => {
    setActiveTab(tab);
    if (tab !== "complaints") {
      setActiveFilter(tab);
    }
  };

  const displaySource = detail ?? preview;
  const sheetTitle = displaySource
    ? getRequestDetailTitle(displaySource)
    : "جزئیات درخواست";
  const sheetSubtitle = displaySource
    ? getRequestDetailSubtitle(displaySource)
    : null;

  const complaintSource = complaintDetail ?? complaintPreview;
  const complaintSheetTitle = complaintSource?.title ?? "جزئیات شکایت";
  const complaintSheetSubtitle =
    complaintSource?.category_display?.trim() || null;

  const listClassName =
    "mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-2";

  return (
    <PageShell>
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">درخواست‌های من</h1>
        </section>

        <RequestFilterTabs activeFilter={activeTab} onChange={handleTabChange} />

        {isComplaintsTab ? (
          <section className={listClassName}>
            {isComplaintsLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <RequestCardSkeleton key={index} />
                ))
              : null}

            {!isComplaintsLoading &&
            !complaintsError &&
            complaints.length === 0 ? (
              <div className="md:col-span-2">
                <div className="flex flex-col items-center glass-card border-dashed px-6 py-12 text-center">
                  <p className="text-heading-md text-ink">
                    هنوز شکایتی ثبت نکرده‌اید
                  </p>
                  <p className="mt-2 max-w-sm text-body-sm text-body-text">
                    در صورت وجود مشکل می‌توانید شکایت خود را ثبت کنید تا سرپرست
                    بررسی و پاسخ دهد.
                  </p>
                  <Link
                    to="/complaints"
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-button-md text-on-primary transition-colors hover:bg-primary-pressed"
                  >
                    ثبت شکایت
                  </Link>
                </div>
              </div>
            ) : null}

            {!isComplaintsLoading && !complaintsError
              ? complaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={openComplaintDetail}
                  />
                ))
              : null}
          </section>
        ) : (
          <section className={listClassName}>
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
        )}
      </ContentContainer>

      {!isComplaintsTab && error ? (
        <Toast message={error} onRetry={retry} />
      ) : null}
      {!isComplaintsTab && detailError ? (
        <Toast message={detailError} onRetry={retryDetail} />
      ) : null}
      {isComplaintsTab && complaintsError ? (
        <Toast message={complaintsError} onRetry={retryComplaints} />
      ) : null}
      {isComplaintsTab && complaintDetailError ? (
        <Toast message={complaintDetailError} onRetry={retryComplaintDetail} />
      ) : null}

      <BottomSheet
        isOpen={!isComplaintsTab && selectedId !== null}
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

      <BottomSheet
        isOpen={isComplaintsTab && complaintSelectedId !== null}
        onClose={closeComplaintDetail}
        title={complaintSheetTitle}
        subtitle={complaintSheetSubtitle}
      >
        <ComplaintDetailSheet
          complaint={complaintDetail}
          preview={complaintPreview}
          isLoading={isComplaintDetailLoading}
          error={complaintDetailError}
          onRetry={retryComplaintDetail}
        />
      </BottomSheet>

      <BottomNav activeTab="requests" />
    </PageShell>
  );
}
