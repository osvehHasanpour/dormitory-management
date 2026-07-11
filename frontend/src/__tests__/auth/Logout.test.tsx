import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { BottomNav } from "../../components/layout/BottomNav";
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

const mockLogoutRequest = jest.fn();

jest.mock("../../services/authService", () => ({
  logoutRequest: (...args: unknown[]) => mockLogoutRequest(...args),
}));

function createLoggedInAuth(overrides?: Partial<AuthContextValue>) {
  const user: AuthUser = {
    id: 1,
    personnel_code: "401234567",
    first_name: "Test",
    last_name: "User",
    role: "student",
    full_name: "Test User",
    is_active: true,
  };
  const tokens: AuthTokens = {
    access: "access-token",
    refresh: "refresh-token",
  };

  return {
    user,
    tokens,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    ...overrides,
  } satisfies AuthContextValue;
}

describe("Authentication – Scenario 3: Logout", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogoutRequest.mockReset();
    mockLogoutRequest.mockResolvedValue(undefined);
  });

  it("terminates the session and redirects to the login page", async () => {
    const logoutSpy = jest.fn();
    const auth = createLoggedInAuth({ logout: logoutSpy });

    render(
      <TestProviders auth={auth} initialEntries={["/dashboard"]}>
        <BottomNav activeTab="home" />
      </TestProviders>,
    );

    fireEvent.click(screen.getByRole("button", { name: "خروج" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "بله خروج" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });

    expect(mockLogoutRequest).toHaveBeenCalledWith("refresh-token");
    expect(logoutSpy).toHaveBeenCalled();
  });
});
