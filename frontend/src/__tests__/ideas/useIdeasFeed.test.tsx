import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "../../context/authContext";
import { useIdeasFeed } from "../../hooks/useIdeasFeed";
import type { IdeaFeedItem } from "../../types/idea";

const mockFetchIdeas = jest.fn();
const mockVoteIdea = jest.fn();

jest.mock("../../services/ideaService", () => ({
  fetchIdeas: (...args: unknown[]) => mockFetchIdeas(...args),
  voteIdea: (...args: unknown[]) => mockVoteIdea(...args),
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

const sampleIdea: IdeaFeedItem = {
  id: 7,
  title: "ایده بهبود فضای سبز",
  description: "کاشت گل در حیاط",
  status: "pending",
  status_display: "در انتظار",
  type: "idea",
  type_display: "ایده",
  likes_count: 3,
  dislikes_count: 1,
  user_vote: null,
  is_owner: false,
  author: {
    id: 5,
    personnel_code: "401111111",
    first_name: "Ali",
    last_name: "Test",
  },
};

describe("Ideas & Voting – Scenario 1: Like an Idea (feed update)", () => {
  beforeEach(() => {
    mockFetchIdeas.mockReset();
    mockVoteIdea.mockReset();
  });

  it("updates the vote counter after a successful like", async () => {
    const auth = createAuthValue({
      isAuthenticated: true,
      tokens: { access: "access-token", refresh: "refresh-token" },
    });

    mockFetchIdeas.mockResolvedValue({ results: [sampleIdea] });
    mockVoteIdea.mockResolvedValue({
      ...sampleIdea,
      likes_count: 4,
      user_vote: "up",
    });

    const { result } = renderHook(() => useIdeasFeed(), {
      wrapper: wrapperFactory(auth),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.ideas[0]?.likes_count).toBe(3);

    await act(async () => {
      await result.current.vote(7, "up");
    });

    expect(mockVoteIdea).toHaveBeenCalledWith(7, "up", "access-token");
    expect(result.current.ideas[0]?.likes_count).toBe(4);
    expect(result.current.ideas[0]?.user_vote).toBe("up");
  });
});
