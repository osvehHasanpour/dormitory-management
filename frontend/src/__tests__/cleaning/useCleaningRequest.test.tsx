import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { CleaningRequestForm } from "../../components/cleaning/CleaningRequestForm";
import { useCleaningRequest } from "../../hooks/useCleaningRequest";
import type { CleaningRequestFormValues } from "../../types/cleaning";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../../components/cleaning/BlockFloorSelector", () => ({
  BlockFloorSelector: ({
    blockError,
    floorError,
  }: {
    blockError?: string;
    floorError?: string;
  }) => (
    <div>
      {blockError ? <p>{blockError}</p> : null}
      {floorError ? <p>{floorError}</p> : null}
    </div>
  ),
}));

const mockSubmitCleaningRequest = jest.fn();

jest.mock("../../services/cleaningService", () => ({
  submitCleaningRequest: (...args: unknown[]) =>
    mockSubmitCleaningRequest(...args),
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

describe("Cleaning Requests – Scenario 2: Submit with Missing Required Information", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmitCleaningRequest.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("blocks submission and shows validation messages on the form", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "t", refresh: "r" },
    });

    render(
      <AuthContext.Provider value={auth}>
        <CleaningRequestForm />
      </AuthContext.Provider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "ارسال درخواست نظافت" }),
    );

    expect(
      await screen.findByText("انتخاب بلوک الزامی است."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("انتخاب طبقه الزامی است."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("انتخاب لاین الزامی است."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("انتخاب فضا الزامی است."),
    ).toBeInTheDocument();
    expect(await screen.findByText("توضیحات الزامی است.")).toBeInTheDocument();
  });

});

describe("Cleaning Requests – Scenario 1: Submit a Cleaning Request", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockSubmitCleaningRequest.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("blocks submit when unauthenticated", async () => {
    const auth = createAuthValue({ isAuthenticated: false, tokens: null });
    const { result } = renderHook(() => useCleaningRequest(), {
      wrapper: wrapperFactory(auth),
    });

    const values: CleaningRequestFormValues = {
      blockId: "1",
      floorId: "2",
      line: "A",
      spaceType: "room",
      description: "desc",
    };

    await act(async () => {
      await result.current.submitRequest(values, {
        blockName: "B1",
        floorLabel: "2",
      });
    });

    expect(result.current.error).toBe(
      "برای ثبت درخواست نظافت باید وارد سامانه شوید.",
    );
    expect(mockSubmitCleaningRequest).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("submits successfully and navigates to my requests", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    mockSubmitCleaningRequest.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCleaningRequest(), {
      wrapper: wrapperFactory(auth),
    });

    const values: CleaningRequestFormValues = {
      blockId: "1",
      floorId: "2",
      line: "A",
      spaceType: "room",
      description: "desc",
    };

    await act(async () => {
      await result.current.submitRequest(values, {
        blockName: "B1",
        floorLabel: "2",
      });
    });

    expect(mockSubmitCleaningRequest).toHaveBeenCalledWith(
      values,
      "access-token",
      "B1",
      "2",
    );
    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBe(
      "درخواست نظافت با موفقیت ثبت شد.",
    );

    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/my-requests", {
      replace: true,
    });
  });
});
