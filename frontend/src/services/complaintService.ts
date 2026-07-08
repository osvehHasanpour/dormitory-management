import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  ComplaintRequestFormValues,
  ComplaintRequestResponse,
  MyComplaintDetail,
  PaginatedComplaintsData,
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

export async function fetchMyComplaints(
  accessToken: string,
): Promise<PaginatedComplaintsData> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<PaginatedComplaintsData>
    >("/v1/complaints/my/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت شکایات ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function fetchComplaintDetail(
  accessToken: string,
  complaintId: number,
): Promise<MyComplaintDetail> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<MyComplaintDetail>>(
      `/v1/complaints/${complaintId}/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت جزئیات شکایت ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}
