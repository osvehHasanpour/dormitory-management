import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BottomNav } from '../../components/layout/BottomNav'
import { DeleteClassConfirm } from '../../components/supervisor-classes/DeleteClassConfirm'
import { SupervisorClassCard } from '../../components/supervisor-classes/SupervisorClassCard'
import { SupervisorClassCardSkeleton } from '../../components/supervisor-classes/SupervisorClassCardSkeleton'
import { SupervisorClassEmptyState } from '../../components/supervisor-classes/SupervisorClassEmptyState'
import { SupervisorClassFormSheet } from '../../components/supervisor-classes/SupervisorClassFormSheet'
import { SupervisorClassTabs } from '../../components/supervisor-classes/SupervisorClassTabs'
import { Toast } from '../../components/ui/Toast'
import { supervisorClassTabs } from '../../data/supervisorClassItems'
import { useSupervisorClasses } from '../../hooks/useSupervisorClasses'
import type { SupervisorClassItem } from '../../types/supervisorClass'

interface FormSheetState {
  isOpen: boolean
  mode: 'create' | 'edit'
  classItem: SupervisorClassItem | null
}

export function SupervisorClassesPage() {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    retry,
    refresh,
    feedbackMessage,
    setFeedback,
    cancelClass,
    cancellingId,
  } = useSupervisorClasses()

  const [formSheet, setFormSheet] = useState<FormSheetState>({
    isOpen: false,
    mode: 'create',
    classItem: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<SupervisorClassItem | null>(null)

  const activeTabLabel =
    supervisorClassTabs.find((tab) => tab.value === activeTab)?.label ?? ''

  const openCreate = () => {
    setFormSheet({ isOpen: true, mode: 'create', classItem: null })
  }

  const openEdit = (classItem: SupervisorClassItem) => {
    setFormSheet({ isOpen: true, mode: 'edit', classItem })
  }

  const closeForm = () => {
    setFormSheet((prev) => ({ ...prev, isOpen: false }))
  }

  const handleFormSuccess = (_item: SupervisorClassItem, mode: 'create' | 'edit') => {
    closeForm()
    setFeedback(mode === 'edit' ? 'کلاس با موفقیت ویرایش شد.' : 'کلاس جدید با موفقیت ثبت شد.')
    refresh()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    const succeeded = await cancelClass(deleteTarget.id)
    if (succeeded) {
      setDeleteTarget(null)
    }
  }

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
        <h1 className="text-heading-lg text-ink">مدیریت کلاس‌ها</h1>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 sm:px-6">
        <SupervisorClassTabs activeTab={activeTab} onChange={setActiveTab} />

        <section className="mt-6 space-y-3">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <SupervisorClassCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && items.length === 0 ? (
            <SupervisorClassEmptyState filterLabel={activeTabLabel} />
          ) : null}

          {!isLoading && !error
            ? items.map((classItem) => (
                <SupervisorClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  isCancelling={cancellingId === classItem.id}
                />
              ))
            : null}
        </section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 px-4 sm:px-6">
        <div className="pointer-events-auto mx-auto flex max-w-lg justify-start">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-button-md text-on-primary shadow-elevated transition-colors hover:bg-primary-pressed"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            <span>ثبت کلاس جدید</span>
          </button>
        </div>
      </div>

      {error ? <Toast message={error} onRetry={retry} /> : null}
      {!error && feedbackMessage ? <Toast message={feedbackMessage} /> : null}

      <SupervisorClassFormSheet
        isOpen={formSheet.isOpen}
        mode={formSheet.mode}
        initialClass={formSheet.classItem}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
      />

      <DeleteClassConfirm
        isOpen={deleteTarget !== null}
        classItem={deleteTarget}
        isDeleting={deleteTarget !== null && cancellingId === deleteTarget.id}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <BottomNav variant="supervisor" activeTab="home" />
    </div>
  )
}
