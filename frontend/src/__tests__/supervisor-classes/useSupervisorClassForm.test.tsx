import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useSupervisorClassForm } from "../../hooks/useSupervisorClassForm";
import type { SupervisorClassItem } from "../../types/supervisorClass";

const mockCreateSupervisorClass = jest.fn();

jest.mock("../../services/supervisorClassService", () => ({
  createSupervisorClass: (...args: unknown[]) =>
    mockCreateSupervisorClass(...args),
  updateSupervisorClass: jest.fn(),
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

const createdClass: SupervisorClassItem = {
  id: 99,
  title: "کلاس جدید",
  description: "",
  location: "سالن A",
  category: "general",
  category_display: "عمومی",
  status: "active",
  status_display: "فعال",
  capacity: 25,
  enrolled_count: 0,
  remaining_capacity: 25,
  is_full: false,
  start_datetime: "2026-09-01T08:00:00.000Z",
  end_datetime: "2026-12-01T10:00:00.000Z",
  day_of_week: "monday",
  day_of_week_display: "دوشنبه",
  start_time: "08:00:00",
  end_time: "10:00:00",
  teacher: null,
  created_by: null,
  average_rating: null,
  ratings_count: 0,
};

describe("Class Management – Scenario 1: Create a Class", () => {
  beforeEach(() => {
    mockCreateSupervisorClass.mockReset();
  });

  it("creates a class successfully and notifies the caller", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    const onSuccess = jest.fn();
    mockCreateSupervisorClass.mockResolvedValue(createdClass);

    const { result } = renderHook(() => useSupervisorClassForm({ onSuccess }), {
      wrapper: wrapperFactory(auth),
    });

    act(() => {
      result.current.form.reset({
        title: "کلاس جدید",
        teacher_id: "3",
        location: "سالن A",
        capacity: "25",
        start_datetime: "2026-09-01T08:00",
        end_datetime: "2026-12-01T10:00",
        day_of_week: "monday",
        start_time: "08:00",
        end_time: "10:00",
      });
    });

    await act(async () => {
      await result.current.submit({ mode: "create" });
    });

    expect(mockCreateSupervisorClass).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(createdClass, "create");
    expect(result.current.toastMessage).toBeNull();
  });
});
