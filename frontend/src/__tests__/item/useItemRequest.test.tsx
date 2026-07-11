import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useItemRequest } from "../../hooks/useItemRequest";
import type { ItemRequestFormValues } from "../../types/item";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../../hooks/useRoomAssignment", () => ({
  useRoomAssignment: () => ({
    blockName: "بلوک الف",
    roomNumber: "۱۰۱",
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const mockSubmitItemRequest = jest.fn();

jest.mock("../../services/itemService", () => ({
  submitItemRequest: (...args: unknown[]) => mockSubmitItemRequest(...args),
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

describe("Room Equipment Request – Scenario 1: Submit an Equipment Request", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmitItemRequest.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("submits the equipment request successfully", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    mockSubmitItemRequest.mockResolvedValue(undefined);

    const { result } = renderHook(() => useItemRequest(), {
      wrapper: wrapperFactory(auth),
    });

    const values: ItemRequestFormValues = {
      block: "بلوک الف",
      roomNumber: "۱۰۱",
      itemId: "5",
      quantity: 1,
      description: "نیاز فوری",
    };

    await act(async () => {
      await result.current.submitRequest(values);
    });

    expect(mockSubmitItemRequest).toHaveBeenCalledWith(values, "access-token");
    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBe(
      "درخواست لوازم با موفقیت ثبت شد.",
    );

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/my-requests", {
      replace: true,
    });
  });
});
