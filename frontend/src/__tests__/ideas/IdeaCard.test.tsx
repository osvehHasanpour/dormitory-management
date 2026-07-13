import { render, screen, fireEvent } from "@testing-library/react";

import { IdeaCard } from "../../components/idea/IdeaCard";
import type { IdeaFeedItem } from "../../types/idea";

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

describe("Ideas & Voting – Scenario 1: Like an Idea", () => {
  it("records a like when the student clicks the vote button", () => {
    const onVote = jest.fn();

    render(
      <IdeaCard
        idea={sampleIdea}
        isVoting={false}
        isExpanded={false}
        anyExpanded={false}
        onToggle={jest.fn()}
        onVote={onVote}
      />,
    );

    expect(screen.getByText("ایده بهبود فضای سبز")).toBeInTheDocument();
    expect(screen.getByText("۳")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "پسندیدن ایده" }));

    expect(onVote).toHaveBeenCalledWith(7, "up");
  });
});
