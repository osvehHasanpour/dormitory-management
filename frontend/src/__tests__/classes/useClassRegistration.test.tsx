import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useClassRegistration } from "../../hooks/useClassRegistration";
import type { StudentClassItem } from "../../types/class";

const mockFetchActiveClasses = jest.fn();
const mockFetchMyClasses = jest.fn();
const mockRegisterClass = jest.fn();

jest.mock("../../services/classService", () => ({
  fetchActiveClasses: (...args: unknown[]) => mockFetchActiveClasses(...args),
  fetchMyClasses: (...args: unknown[]) => mockFetchMyClasses(...args),
  fetchMyEndedClasses: jest.fn().mockResolvedValue({ results: [] }),
  registerClass: (...args: unknown[]) => mockRegisterClass(...args),
  cancelClassRegistration: jest.fn(),
  submitClassRating: jest.fn(),
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

const availableClass: StudentClassItem = {
  id: 42,
  title: "کلاس خوشنویسی",
  description: "آموزش مقدماتی",
  location: "سالن فرهنگی",
  category: "art",
  category_display: "هنری",
  capacity: 20,
  registered_count: 5,
  remaining_capacity: 15,
  is_full: false,
  start_datetime: "2026-08-01T10:00:00Z",
  end_datetime: "2026-08-01T12:00:00Z",
  day_of_week: "saturday",
  day_of_week_display: "شنبه",
  start_time: "10:00:00",
  end_time: "12:00:00",
  teacher: null,
  created_by: null,
  average_rating: null,
  is_enrolled: false,
  can_rate: false,
  user_rating: null,
};

const enrolledClass: StudentClassItem = {
  ...availableClass,
  is_enrolled: true,
  registered_count: 6,
  remaining_capacity: 14,
};

describe("Class Registration – Scenario 1: View Available Classes and Register", () => {
  beforeEach(() => {
    mockFetchActiveClasses.mockReset();
    mockFetchMyClasses.mockReset();
    mockRegisterClass.mockReset();
  });

  it("displays available classes, registers successfully, and refreshes enrolled list", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });

    mockFetchActiveClasses.mockResolvedValue({ results: [availableClass] });
    mockFetchMyClasses
      .mockResolvedValueOnce({ results: [] })
      .mockResolvedValue({ results: [enrolledClass] });
    mockRegisterClass.mockResolvedValue(undefined);

    const { result } = renderHook(() => useClassRegistration(), {
      wrapper: wrapperFactory(auth),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.classes).toEqual([availableClass]);
    expect(result.current.error).toBeNull();

    let registered = false;
    await act(async () => {
      registered = await result.current.registerInClass(42);
    });

    expect(registered).toBe(true);
    expect(mockRegisterClass).toHaveBeenCalledWith("access-token", 42);
    expect(result.current.feedbackMessage).toBe("ثبت‌نام با موفقیت انجام شد.");

    expect(mockFetchMyClasses).toHaveBeenCalled();
    expect(mockFetchActiveClasses).toHaveBeenCalledTimes(2);
  });
});
