import { useNavigate } from "react-router-dom";

import { IdeaCard } from "../../components/idea/IdeaCard";
import { IdeaCardSkeleton } from "../../components/idea/IdeaCardSkeleton";
import { IdeasEmptyState } from "../../components/idea/IdeasEmptyState";
import { IdeaSortMenu } from "../../components/idea/IdeaSortMenu";
import { BottomNav } from "../../components/layout/BottomNav";
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

        <IdeaSortMenu activeOrdering={ordering} onChange={setOrdering} />
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">مشاهده ایده‌ها</h1>
        </section>

        <section className="space-y-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <IdeaCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && ideas.length === 0 ? (
            <IdeasEmptyState />
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
      </main>

      {error ? <Toast message={error} onRetry={retry} /> : null}

      <BottomNav activeTab="home" />
    </div>
  );
}
