import type {
  FeedbackFilterValue,
  FeedbackType,
} from "../types/supervisorFeedback";

export interface FeedbackFilterTab {
  value: FeedbackFilterValue;
  label: string;
  apiType?: "complaint" | "suggestion";
}

export const feedbackFilterTabs: FeedbackFilterTab[] = [
  { value: "all", label: "همه" },
  { value: "complaint", label: "شکایت", apiType: "complaint" },
  { value: "suggestion", label: "پیشنهاد", apiType: "suggestion" },
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
    className: "bg-[#d4f0f0] text-[#1a5c5c]",
  },
  complaint: {
    label: "شکایت",
    className: "bg-[#fde8e0] text-[#8b3a2a]",
  },
  suggestion: {
    label: "پیشنهاد",
    className: "bg-surface-card text-ink",
  },
};
