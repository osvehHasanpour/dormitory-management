import { AlertTriangle } from "lucide-react";

import type { SupervisorClassItem } from "../../types/supervisorClass";
import { BottomSheet } from "../ui/BottomSheet";

interface DeleteClassConfirmProps {
  isOpen: boolean;
  classItem: SupervisorClassItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteClassConfirm({
  isOpen,
  classItem,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteClassConfirmProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="حذف کلاس"
      subtitle={classItem?.title ?? null}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-md bg-error-pale p-4">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-error"
            strokeWidth={2}
            aria-hidden="true"
          />
          <p className="text-body-md text-ink">
            آیا از حذف این کلاس اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </p>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex h-11 w-full items-center justify-center rounded-md bg-error text-button-md text-on-primary transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "در حال حذف..." : "بله، حذف شود"}
        </button>
      </div>
    </BottomSheet>
  );
}
