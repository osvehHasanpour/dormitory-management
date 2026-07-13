import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AnnouncementCard } from "../../components/announcement/AnnouncementCard";
import { AnnouncementCardSkeleton } from "../../components/announcement/AnnouncementCardSkeleton";
import { AnnouncementsEmptyState } from "../../components/announcement/AnnouncementsEmptyState";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { FixedBottomAction } from "../../components/layout/FixedBottomAction";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { Toast } from "../../components/ui/Toast";
import { useAnnouncementsFeed } from "../../hooks/useAnnouncementsFeed";

export function SupervisorAnnouncementsPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { announcements, isLoading, error, retry } = useAnnouncementsFeed();
  const anyExpanded = expandedId !== null;
  const gridClassName = [
    "space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0",
    anyExpanded ? "md:items-start" : "md:items-stretch",
  ].join(" ");

  return (
    <PageShell bottomSpacing="nav-cta">
      <PageHeader breadcrumb="مدیریت اطلاعیه‌ها" onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">اطلاعیه‌های خوابگاه</h1>
          <p className="mt-2 text-body-sm text-mute">
            مدیریت و ارسال اطلاعیه‌های جدید
          </p>
        </section>

        <section className={gridClassName}>
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <AnnouncementCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && announcements.length === 0 ? (
            <div className="md:col-span-2">
              <AnnouncementsEmptyState />
            </div>
          ) : null}

          {!isLoading && !error
            ? announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isExpanded={expandedId === announcement.id}
                  anyExpanded={anyExpanded}
                  onToggle={() =>
                    setExpandedId((current) =>
                      current === announcement.id ? null : announcement.id,
                    )
                  }
                />
              ))
            : null}
        </section>
      </ContentContainer>

      {error ? <Toast message={error} onRetry={retry} /> : null}

      <FixedBottomAction>
        <button
          type="button"
          onClick={() => navigate("/supervisor/announcements/new")}
          className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary shadow-elevated transition-colors hover:bg-primary-pressed lg:max-w-md"
        >
          + ثبت اطلاعیه جدید
        </button>
      </FixedBottomAction>

      <BottomNav variant="supervisor" activeTab="home" />
    </PageShell>
  );
}
