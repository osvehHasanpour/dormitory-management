import { useNavigate } from "react-router-dom";

import { AnnouncementCard } from "../../components/announcement/AnnouncementCard";
import { AnnouncementCardSkeleton } from "../../components/announcement/AnnouncementCardSkeleton";
import { AnnouncementsEmptyState } from "../../components/announcement/AnnouncementsEmptyState";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { Toast } from "../../components/ui/Toast";
import { useAnnouncementsFeed } from "../../hooks/useAnnouncementsFeed";

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const { announcements, isLoading, error, retry } = useAnnouncementsFeed();

  return (
    <PageShell>
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">لیست اطلاعیه‌ها</h1>
        </section>

        <section className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
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
                />
              ))
            : null}
        </section>
      </ContentContainer>

      {error ? <Toast message={error} onRetry={retry} /> : null}

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
