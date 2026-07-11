import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useBoothRequest } from "../../hooks/useBoothRequest";
import type { BoothRequestFormValues } from "../../types/booth";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSubmitBoothRequest = jest.fn();

jest.mock("../../services/boothService", () => ({
  submitBoothRequest: (...args: unknown[]) => mockSubmitBoothRequest(...args),
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

describe("Booth Request – Scenario 1: Submit a Booth Request", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmitBoothRequest.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("submits the booth request successfully", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    mockSubmitBoothRequest.mockResolvedValue(undefined);

    const { result } = renderHook(() => useBoothRequest(), {
      wrapper: wrapperFactory(auth),
    });

    const values: BoothRequestFormValues = {
      title: "غرفه صنایع دستی",
      category: "صنایع دستی و سوغات",
      tableCount: "1",
      description: "فروش سوغات محلی",
    };

    await act(async () => {
      await result.current.submitRequest(values);
    });

    expect(mockSubmitBoothRequest).toHaveBeenCalledWith(values, "access-token");
    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBe(
      "درخواست غرفه با موفقیت ثبت شد.",
    );

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/my-requests", {
      replace: true,
    });
  });
});
