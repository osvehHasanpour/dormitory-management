import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BottomNav } from "../../components/layout/BottomNav";
import { ContentContainer } from "../../components/layout/ContentContainer";
import { FixedBottomAction } from "../../components/layout/FixedBottomAction";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { DeleteClassConfirm } from "../../components/supervisor-classes/DeleteClassConfirm";
import { SupervisorClassCard } from "../../components/supervisor-classes/SupervisorClassCard";
import { SupervisorClassCardSkeleton } from "../../components/supervisor-classes/SupervisorClassCardSkeleton";
import { SupervisorClassEmptyState } from "../../components/supervisor-classes/SupervisorClassEmptyState";
import { SupervisorClassFormSheet } from "../../components/supervisor-classes/SupervisorClassFormSheet";
import { SupervisorClassTabs } from "../../components/supervisor-classes/SupervisorClassTabs";
import { Toast } from "../../components/ui/Toast";
import { supervisorClassTabs } from "../../data/supervisorClassItems";
import { useSupervisorClasses } from "../../hooks/useSupervisorClasses";
import type { SupervisorClassItem } from "../../types/supervisorClass";

interface FormSheetState {
  isOpen: boolean;
  mode: "create" | "edit";
  classItem: SupervisorClassItem | null;
}

export function SupervisorClassesPage() {
  const navigate = useNavigate();
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
  } = useSupervisorClasses();

  const [formSheet, setFormSheet] = useState<FormSheetState>({
    isOpen: false,
    mode: "create",
    classItem: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<SupervisorClassItem | null>(
    null,
  );

  const activeTabLabel =
    supervisorClassTabs.find((tab) => tab.value === activeTab)?.label ?? "";

  const openCreate = () => {
    setFormSheet({ isOpen: true, mode: "create", classItem: null });
  };

  const openEdit = (classItem: SupervisorClassItem) => {
    setFormSheet({ isOpen: true, mode: "edit", classItem });
  };

  const closeForm = () => {
    setFormSheet((prev) => ({ ...prev, isOpen: false }));
  };

  const handleFormSuccess = (
    _item: SupervisorClassItem,
    mode: "create" | "edit",
  ) => {
    closeForm();
    setFeedback(
      mode === "edit"
        ? "کلاس با موفقیت ویرایش شد."
        : "کلاس جدید با موفقیت ثبت شد.",
    );
    refresh();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const succeeded = await cancelClass(deleteTarget.id);
    if (succeeded) {
      setDeleteTarget(null);
    }
  };

  return (
    <PageShell bottomSpacing="nav-fab">
      <PageHeader title="مدیریت کلاس‌ها" onBack={() => navigate(-1)} />

      <ContentContainer as="main">
        <SupervisorClassTabs activeTab={activeTab} onChange={setActiveTab} />

        <section className="mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <SupervisorClassCardSkeleton key={index} />
              ))
            : null}

          {!isLoading && !error && items.length === 0 ? (
            <div className="md:col-span-2">
              <SupervisorClassEmptyState filterLabel={activeTabLabel} />
            </div>
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
      </ContentContainer>

      <FixedBottomAction align="start">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-button-md text-on-primary shadow-elevated transition-colors hover:bg-primary-pressed"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          <span>ثبت کلاس جدید</span>
        </button>
      </FixedBottomAction>

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
    </PageShell>
  );
}
