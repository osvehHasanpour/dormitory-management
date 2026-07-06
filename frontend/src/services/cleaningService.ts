import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  CleaningRequestFormValues,
  CleaningRequestResponse,
} from "../types/cleaning";
import { cleaningLines, cleaningSpaceTypes } from "../types/cleaning";

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function resolveLabel(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

function buildLocation(
  blockName: string,
  floorLabel: string,
  lineLabel: string,
  spaceLabel: string,
): string {
  return `${blockName} - ${floorLabel} - ${lineLabel} - ${spaceLabel}`;
}

export async function submitCleaningRequest(
  values: CleaningRequestFormValues,
  accessToken: string,
  blockName: string,
  floorLabel: string,
): Promise<CleaningRequestResponse> {
  const lineLabel = resolveLabel(cleaningLines, values.line);
  const spaceLabel = resolveLabel(cleaningSpaceTypes, values.spaceType);
  const location = buildLocation(blockName, floorLabel, lineLabel, spaceLabel);
  const preferredDate = new Date().toISOString().slice(0, 10);

  try {
    const response = await apiClient.post<
      ApiSuccessResponse<CleaningRequestResponse>
    >(
      "/v1/requests/cleaning/",
      {
        description: values.description.trim(),
        location,
        preferred_date: preferredDate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "ثبت درخواست نظافت ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      {
        cause: error,
      },
    );
  }
}

export { fetchBlocks, fetchFloors } from "./blockService";
