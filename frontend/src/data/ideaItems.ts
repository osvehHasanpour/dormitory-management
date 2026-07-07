import type { IdeaOrdering } from "../types/idea";

export const ideaSortOptions: { value: IdeaOrdering; label: string }[] = [
  { value: "most_votes", label: "بیشترین رأی" },
  { value: "least_votes", label: "کمترین رأی" },
  { value: "newest", label: "جدیدترین" },
];

export function getIdeaSortLabel(ordering: IdeaOrdering): string {
  return (
    ideaSortOptions.find((option) => option.value === ordering)?.label ??
    "جدیدترین"
  );
}
