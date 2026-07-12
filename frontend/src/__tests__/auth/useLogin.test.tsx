import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useLogin } from "../../hooks/useLogin";
import type { AuthTokens, AuthUser } from "../../types/auth";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLoginRequest = jest.fn();

jest.mock("../../services/authService", () => ({
  login: (...args: unknown[]) => mockLoginRequest(...args),
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

describe("useLogin", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLoginRequest.mockReset();
  });

  it("shows validation error when username is empty", async () => {
    const auth = createAuthValue();
    const { result } = renderHook(() => useLogin(), {
      wrapper: wrapperFactory(auth),
    });

    await act(async () => {
      await result.current.submitLogin({ username: "  ", password: "pw" });
    });

    expect(result.current.error).toBe("نام کاربری الزامی است.");
    expect(mockLoginRequest).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows validation error when password is empty", async () => {
    const auth = createAuthValue();
    const { result } = renderHook(() => useLogin(), {
      wrapper: wrapperFactory(auth),
    });

    await act(async () => {
      await result.current.submitLogin({ username: "u", password: "" });
    });

    expect(result.current.error).toBe("رمز عبور الزامی است.");
    expect(mockLoginRequest).not.toHaveBeenCalled();
  });

  it("logs in and navigates to dashboard path for role", async () => {
    const loginSpy = jest.fn();
    const auth = createAuthValue({ login: loginSpy });

    const tokens: AuthTokens = { access: "access", refresh: "refresh" };
    const user: AuthUser = {
      id: 1,
      personnel_code: "401234567",
      first_name: "Test",
      last_name: "User",
      role: "student",
      full_name: "Test User",
      is_active: true,
    };

    mockLoginRequest.mockResolvedValue({ tokens, user });

    const { result } = renderHook(() => useLogin(), {
      wrapper: wrapperFactory(auth),
    });

    await act(async () => {
      await result.current.submitLogin({
        username: "401234567",
        password: "pw",
      });
    });

    expect(mockLoginRequest).toHaveBeenCalledWith({
      username: "401234567",
      password: "pw",
    });
    expect(loginSpy).toHaveBeenCalledWith(tokens, user);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(result.current.error).toBeNull();
  });

  it("surfaces server error message on failed login", async () => {
    const auth = createAuthValue();
    mockLoginRequest.mockRejectedValue(
      new Error("نام کاربری یا رمز عبور اشتباه است."),
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: wrapperFactory(auth),
    });

    await act(async () => {
      await result.current.submitLogin({ username: "u", password: "pw" });
    });

    expect(result.current.error).toBe("نام کاربری یا رمز عبور اشتباه است.");
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
