import { normalizeFeedbackType } from "../data/supervisorFeedbackItems";
import type {
  FeedbackAuthorSummary,
  FeedbackStatus,
  SupervisorFeedbackItem,
} from "../types/supervisorFeedback";
import type { StatusBadgeVariant } from "./requestHelpers";

const STATUS_BADGE_VARIANT: Record<FeedbackStatus, StatusBadgeVariant> = {
  pending: "pending",
  reviewed: "reviewed",
  answered: "approved",
  rejected: "rejected",
};

export function getFeedbackStatusBadgeVariant(
  status: FeedbackStatus,
): StatusBadgeVariant {
  return STATUS_BADGE_VARIANT[status];
}

export function formatFeedbackAuthor(author: FeedbackAuthorSummary): string {
  const fullName = `${author.first_name} ${author.last_name}`.trim();
  const parts = [fullName || author.personnel_code];

  if (author.block) {
    parts.push(`بلوک ${author.block}`);
  }

  return parts.join(" · ");
}

export function buildFeedbackPreview(
  description: string,
  maxLength = 100,
): string {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trim()}...`;
}

export function canMarkReviewed(item: SupervisorFeedbackItem): boolean {
  return (
    normalizeFeedbackType(item.type) === "complaint" && item.status === "pending"
  );
}

export function canRespond(item: SupervisorFeedbackItem): boolean {
  return (
    normalizeFeedbackType(item.type) === "complaint" &&
    (item.status === "pending" || item.status === "reviewed")
  );
}

export function canReject(item: SupervisorFeedbackItem): boolean {
  return canRespond(item);
}

export function canApproveIdea(item: SupervisorFeedbackItem): boolean {
  return (
    normalizeFeedbackType(item.type) === "idea" && item.status === "pending"
  );
}

export function canRejectIdea(item: SupervisorFeedbackItem): boolean {
  return (
    normalizeFeedbackType(item.type) === "idea" && item.status === "pending"
  );
}

export function hasAvailableFeedbackActions(
  item: SupervisorFeedbackItem,
): boolean {
  if (normalizeFeedbackType(item.type) === "idea") {
    return canApproveIdea(item) || canRejectIdea(item);
  }

  return canMarkReviewed(item) || canRespond(item) || canReject(item);
}
