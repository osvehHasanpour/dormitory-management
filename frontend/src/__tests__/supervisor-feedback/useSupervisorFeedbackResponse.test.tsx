import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useSupervisorFeedbackResponse } from "../../hooks/useSupervisorFeedbackResponse";
import type { SupervisorFeedbackItem } from "../../types/supervisorFeedback";

const mockRespondToFeedback = jest.fn();

jest.mock("../../services/supervisorFeedbackService", () => ({
  markFeedbackReviewed: jest.fn(),
  respondToFeedback: (...args: unknown[]) => mockRespondToFeedback(...args),
  rejectFeedback: jest.fn(),
  reviewIdea: jest.fn(),
}));

function createAuthValue(
  overrides?: Partial<AuthContextValue>,
): AuthContextValue {
  return {
    user: null,
    tokens: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    ...overrides,
  };
}

function wrapperFactory(auth: AuthContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
  };
}

const feedbackItem: SupervisorFeedbackItem = {
  id: 15,
  type: "idea",
  type_display: "ایده",
  category: null,
  category_display: null,
  title: "ایده جدید",
  description: "پیشنهاد بهبود",
  status: "pending",
  status_display: "در انتظار",
  response_text: "",
  created_at: "2026-07-01T10:00:00Z",
  updated_at: "2026-07-01T10:00:00Z",
  responded_at: null,
  responded_within_sla: null,
  is_sla_overdue: false,
  author: {
    id: 1,
    personnel_code: "401234567",
    first_name: "Test",
    last_name: "Student",
    block: "A",
  },
  responded_by: null,
};

describe("Ideas Management – Scenario 1: View and Respond to Ideas", () => {
  beforeEach(() => {
    mockRespondToFeedback.mockReset();
  });

  it("saves a supervisor response and shows confirmation", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    const onSuccess = jest.fn();
    const updatedItem: SupervisorFeedbackItem = {
      ...feedbackItem,
      status: "answered",
      status_display: "پاسخ داده شده",
      response_text: "ایده خوبی است و بررسی می‌شود.",
    };

    mockRespondToFeedback.mockResolvedValue(updatedItem);

    const { result } = renderHook(
      () => useSupervisorFeedbackResponse({ onSuccess }),
      { wrapper: wrapperFactory(auth) },
    );

    act(() => {
      result.current.form.setValue(
        "response_text",
        "ایده خوبی است و بررسی می‌شود.",
      );
    });

    await act(async () => {
      await result.current.applyStatusAction(feedbackItem, "answered");
    });

    expect(mockRespondToFeedback).toHaveBeenCalledWith(
      "access-token",
      15,
      "ایده خوبی است و بررسی می‌شود.",
    );
    expect(result.current.toastMessage).toBe("پاسخ با موفقیت ثبت شد.");
    expect(onSuccess).toHaveBeenCalledWith(updatedItem);
    expect(result.current.form.getValues("response_text")).toBe(
      "ایده خوبی است و بررسی می‌شود.",
    );
  });
});
