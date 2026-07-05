import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ClassCard } from '../../components/classes/ClassCard'
import { ClassCardSkeleton } from '../../components/classes/ClassCardSkeleton'
import { ClassesEmptyState } from '../../components/classes/ClassesEmptyState'
import { ClassTabs } from '../../components/classes/ClassTabs'
import { RatingBottomSheetContent } from '../../components/classes/RatingBottomSheetContent'
import { BottomNav } from '../../components/layout/BottomNav'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Toast } from '../../components/ui/Toast'
import { useClassRegistration } from '../../hooks/useClassRegistration'
import type { ClassesTabValue, StudentClassItem } from '../../types/class'

const sectionTitles: Record<ClassesTabValue, string> = {
  active: 'کلاس‌های قابل ثبت‌نام',
  enrolled: 'کلاس‌های ثبت‌نام‌شده من',
  ended: 'کلاس‌های پایان‌یافته',
}

export function ClassRegistrationPage() {
  const navigate = useNavigate()
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
  } = useClassRegistration()
  const [selectedRatingClass, setSelectedRatingClass] = useState<StudentClassItem | null>(null)

  const handleTabChange = (tab: ClassesTabValue) => {
    clearFeedback()
    setActiveTab(tab)
  }

  const handleSubmitRating = async (score: number) => {
    if (!selectedRatingClass) {
      return
    }

    const success = await submitRatingForClass(selectedRatingClass.id, { score })
    if (success) {
      setSelectedRatingClass(null)
    }
  }

  const toastMessage = error ?? feedbackMessage

  return (
    <div className="page-gradient min-h-screen pb-32">
      <header className="relative mx-auto flex w-full max-w-lg items-center justify-center px-4 pb-4 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-heading-lg text-ink backdrop-blur-sm active:bg-white/45 sm:right-6"
          aria-label="بازگشت"
        >
          ‹
        </button>
        <span className="mt-2 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <section className="mb-6 text-center">
          <h1 className="text-heading-xl text-ink">ثبت نام در کلاس</h1>
        </section>

        <ClassTabs activeTab={activeTab} onChange={handleTabChange} />

        <section className="mt-5">
          <h2 className="text-heading-lg text-mute">{sectionTitles[activeTab]}</h2>
        </section>

        <section className="mt-4 space-y-3">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => <ClassCardSkeleton key={index} />)
            : null}

          {!isLoading && classes.length === 0 ? <ClassesEmptyState tab={activeTab} /> : null}

          {!isLoading
            ? classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  tab={activeTab}
                  onRegister={(classId) => {
                    void registerInClass(classId)
                  }}
                  onCancel={(classId) => {
                    void cancelEnrollment(classId)
                  }}
                  onRate={setSelectedRatingClass}
                  isActionPending={isActionPending}
                />
              ))
            : null}
        </section>
      </main>

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
            isSubmitting={isActionPending('rate', selectedRatingClass.id)}
            error={null}
            onSubmit={handleSubmitRating}
          />
        ) : null}
      </BottomSheet>

      <BottomNav activeTab="home" />
    </div>
  )
}
