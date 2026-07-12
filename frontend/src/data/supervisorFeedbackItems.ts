import type {
  FeedbackFilterValue,
  FeedbackType,
  LegacyFeedbackType,
} from "../types/supervisorFeedback";

export interface FeedbackFilterTab {
  value: FeedbackFilterValue;
  label: string;
  apiType?: "complaint" | "idea";
}

export const feedbackFilterTabs: FeedbackFilterTab[] = [
  { value: "all", label: "همه" },
  { value: "complaint", label: "شکایت", apiType: "complaint" },
  { value: "idea", label: "ایده", apiType: "idea" },
];

export interface FeedbackTypeBadgeConfig {
  label: string;
  className: string;
}

export const feedbackTypeBadgeConfig: Record<
  FeedbackType,
  FeedbackTypeBadgeConfig
> = {
  idea: {
    label: "ایده",
    className: "bg-idea-pale text-idea-deep",
  },
  complaint: {
    label: "شکایت",
    className: "bg-complaint-pale text-complaint-deep",
  },
};

export function normalizeFeedbackType(type: LegacyFeedbackType): FeedbackType {
  return type === "suggestion" ? "idea" : type;
}

export function getFeedbackTypeBadgeConfig(
  type: LegacyFeedbackType,
): FeedbackTypeBadgeConfig {
  return feedbackTypeBadgeConfig[normalizeFeedbackType(type)];
}
