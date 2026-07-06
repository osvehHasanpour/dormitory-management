import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  ComplaintRequestFormValues,
  ComplaintRequestResponse,
} from "../types/complaint";

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function submitComplaintRequest(
  values: ComplaintRequestFormValues,
  accessToken: string,
): Promise<ComplaintRequestResponse> {
  try {
    const response = await apiClient.post<
      ApiSuccessResponse<ComplaintRequestResponse>
    >(
      "/v1/complaints/",
      {
        category: values.category,
        title: values.title.trim(),
        description: values.description.trim(),
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
      extractApiError(error, "ثبت شکایت ناموفق بود. لطفاً دوباره تلاش کنید."),
      {
        cause: error,
      },
    );
  }
}
