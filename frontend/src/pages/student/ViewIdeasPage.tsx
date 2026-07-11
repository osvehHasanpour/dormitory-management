import { useNavigate } from "react-router-dom";

import { IdeaCard } from "../../components/idea/IdeaCard";
import { IdeaCardSkeleton } from "../../components/idea/IdeaCardSkeleton";
import { IdeasEmptyState } from "../../components/idea/IdeasEmptyState";
import { IdeaSortMenu } from "../../components/idea/IdeaSortMenu";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { Toast } from "../../components/ui/Toast";
import { useIdeasFeed } from "../../hooks/useIdeasFeed";

export function ViewIdeasPage() {
  const navigate = useNavigate();
  const {
    ideas,
    isLoading,
    error,
    ordering,
    setOrdering,
    votingIds,
    retry,
    vote,
  } = useIdeasFeed();

  return (
    <PageShell>
      <PageHeader
        onBack={() => navigate(-1)}
        leftAction={
          <IdeaSortMenu activeOrdering={ordering} onChange={setOrdering} />
        }
      />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">مشاهده ایده‌ها</h1>
        </section>

        <section className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <IdeaCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && ideas.length === 0 ? (
            <div className="md:col-span-2">
              <IdeasEmptyState />
            </div>
          ) : null}

          {!isLoading && !error
            ? ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isVoting={votingIds.has(idea.id)}
                  onVote={vote}
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
