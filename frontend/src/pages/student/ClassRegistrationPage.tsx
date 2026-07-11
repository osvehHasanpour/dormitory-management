import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ClassCard } from "../../components/classes/ClassCard";
import { ClassCardSkeleton } from "../../components/classes/ClassCardSkeleton";
import { ClassesEmptyState } from "../../components/classes/ClassesEmptyState";
import { ClassTabs } from "../../components/classes/ClassTabs";
import { RatingBottomSheetContent } from "../../components/classes/RatingBottomSheetContent";
import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Toast } from "../../components/ui/Toast";
import { useClassRegistration } from "../../hooks/useClassRegistration";
import type { ClassesTabValue, StudentClassItem } from "../../types/class";

const sectionTitles: Record<ClassesTabValue, string> = {
  active: "کلاس‌های قابل ثبت‌نام",
  enrolled: "کلاس‌های ثبت‌نام‌شده من",
  ended: "کلاس‌های پایان‌یافته",
};

export function ClassRegistrationPage() {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    classes,
    isLoading,
    error,
    feedbackMessage,
    retry,
    clearFeedback,
    registerInClass,
    cancelEnrollment,
    submitRatingForClass,
    isActionPending,
  } = useClassRegistration();
  const [selectedRatingClass, setSelectedRatingClass] =
    useState<StudentClassItem | null>(null);

  const handleTabChange = (tab: ClassesTabValue) => {
    clearFeedback();
    setActiveTab(tab);
  };

  const handleSubmitRating = async (score: number) => {
    if (!selectedRatingClass) {
      return;
    }

    const success = await submitRatingForClass(selectedRatingClass.id, {
      score,
    });
    if (success) {
      setSelectedRatingClass(null);
    }
  };

  const toastMessage = error ?? feedbackMessage;

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <section className="mb-6 text-center">
          <h1 className="text-page-title text-ink">ثبت نام در کلاس</h1>
        </section>

        <ClassTabs activeTab={activeTab} onChange={handleTabChange} />

        <section className="mt-5">
          <h2 className="text-heading-lg text-mute">{sectionTitles[activeTab]}</h2>
        </section>

        <section className="mt-4 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <ClassCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && classes.length === 0 ? (
            <div className="md:col-span-2">
              <ClassesEmptyState tab={activeTab} />
            </div>
          ) : null}

          {!isLoading
            ? classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  tab={activeTab}
                  onRegister={(classId) => {
                    void registerInClass(classId);
                  }}
                  onCancel={(classId) => {
                    void cancelEnrollment(classId);
                  }}
                  onRate={setSelectedRatingClass}
                  isActionPending={isActionPending}
                />
              ))
            : null}
        </section>
      </ContentContainer>

      {toastMessage ? (
        <Toast message={toastMessage} onRetry={error ? retry : undefined} />
      ) : null}

      <BottomSheet
        isOpen={selectedRatingClass !== null}
        onClose={() => setSelectedRatingClass(null)}
        title="امتیازدهی"
        subtitle={selectedRatingClass?.title ?? null}
      >
        {selectedRatingClass ? (
          <RatingBottomSheetContent
            classItem={selectedRatingClass}
            isSubmitting={isActionPending("rate", selectedRatingClass.id)}
            error={null}
            onSubmit={handleSubmitRating}
          />
        ) : null}
      </BottomSheet>

      <BottomNav activeTab="home" />
    </PageShell>
  );
}
