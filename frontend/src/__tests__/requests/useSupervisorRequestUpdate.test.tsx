import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useSupervisorRequestUpdate } from "../../hooks/useSupervisorRequestUpdate";
import type { StudentRequestDetail } from "../../types/request";

const mockUpdateSupervisorRequestStatusGraphql = jest.fn();

jest.mock("../../services/supervisorRequestGraphqlService", () => ({
  updateSupervisorRequestStatusGraphql: (...args: unknown[]) =>
    mockUpdateSupervisorRequestStatusGraphql(...args),
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

const requestItem: StudentRequestDetail = {
  id: 10,
  request_type: "cleaning",
  request_type_display: "نظافت",
  status: "pending",
  status_display: "در انتظار",
  description: "نیاز به نظافت",
  created_at: "2026-07-01T10:00:00Z",
  updated_at: "2026-07-01T10:00:00Z",
  user: {
    id: 1,
    personnel_code: "401234567",
    first_name: "Test",
    last_name: "Student",
    role_name: "student",
  },
  handled_by: null,
  assigned_staff: null,
  rejection_reason: "",
  supervisor_response: null,
  status_timeline: [],
  ai_content_flag: null,
};

describe("Request Management – Scenario 1: Update Request Status", () => {
  beforeEach(() => {
    mockUpdateSupervisorRequestStatusGraphql.mockReset();
  });

  it("updates request status and shows a success message", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    const onSuccess = jest.fn();
    const updatedItem: StudentRequestDetail = {
      ...requestItem,
      status: "in_progress",
      status_display: "در حال انجام",
      supervisor_response: "در حال پیگیری",
    };

    mockUpdateSupervisorRequestStatusGraphql.mockResolvedValue(updatedItem);

    const { result } = renderHook(
      () => useSupervisorRequestUpdate({ onSuccess }),
      { wrapper: wrapperFactory(auth) },
    );

    act(() => {
      result.current.form.setValue("status", "in_progress");
      result.current.form.setValue("supervisor_response", "در حال پیگیری");
    });

    await act(async () => {
      await result.current.submit(requestItem);
    });

    expect(mockUpdateSupervisorRequestStatusGraphql).toHaveBeenCalledWith(
      "access-token",
      10,
      {
        status: "in_progress",
        supervisor_response: "در حال پیگیری",
      },
    );
    expect(result.current.toastMessage).toBe(
      "وضعیت درخواست با موفقیت به‌روزرسانی شد.",
    );
    expect(onSuccess).toHaveBeenCalledWith(updatedItem);
  });
});
