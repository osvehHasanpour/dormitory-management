import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { LoginForm } from "../../components/auth/LoginForm";
import { TestProviders } from "../../test/testProviders";
import type { AuthContextValue } from "../../context/authContext";
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

function renderLoginForm(auth = createAuthValue()) {
  return render(
    <TestProviders auth={auth} initialEntries={["/login"]}>
      <LoginForm />
    </TestProviders>,
  );
}

describe("Authentication – Scenario 1: Successful Login", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLoginRequest.mockReset();
  });

  it("authenticates the user and redirects to the dashboard", async () => {
    const loginSpy = jest.fn();
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

    renderLoginForm(createAuthValue({ login: loginSpy }));

    fireEvent.change(screen.getByLabelText("نام کاربری"), {
      target: { value: "401234567" },
    });
    fireEvent.change(screen.getByLabelText("رمز عبور"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ورود" }));

    await waitFor(() => {
      expect(mockLoginRequest).toHaveBeenCalledWith({
        username: "401234567",
        password: "secret",
      });
    });

    expect(loginSpy).toHaveBeenCalledWith(tokens, user);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("Authentication – Scenario 2: Invalid Login", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLoginRequest.mockReset();
  });

  it("shows an error message and keeps the user on the login form", async () => {
    mockLoginRequest.mockRejectedValue(
      new Error("نام کاربری یا رمز عبور اشتباه است."),
    );

    renderLoginForm();

    fireEvent.change(screen.getByLabelText("نام کاربری"), {
      target: { value: "wrong-user" },
    });
    fireEvent.change(screen.getByLabelText("رمز عبور"), {
      target: { value: "wrong-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ورود" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "نام کاربری یا رمز عبور اشتباه است.",
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "ورود" })).toBeInTheDocument();
  });
});
