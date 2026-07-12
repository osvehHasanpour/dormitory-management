import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  SupervisorClassCreatePayload,
  SupervisorClassItem,
  SupervisorClassTabValue,
  SupervisorClassUpdatePayload,
  SupervisorClassesData,
} from "../types/supervisorClass";

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function fetchSupervisorClasses(
  accessToken: string,
  tab: SupervisorClassTabValue = "active",
): Promise<SupervisorClassesData> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<SupervisorClassesData>
    >("/v1/supervisor/classes/", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { status: tab === "finished" ? "finished" : "active" },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت کلاس‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function createSupervisorClass(
  accessToken: string,
  payload: SupervisorClassCreatePayload,
): Promise<SupervisorClassItem> {
  try {
    const response = await apiClient.post<
      ApiSuccessResponse<SupervisorClassItem>
    >("/v1/supervisor/classes/", payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(error, "ثبت کلاس ناموفق بود. لطفاً دوباره تلاش کنید."),
      { cause: error },
    );
  }
}

export async function updateSupervisorClass(
  accessToken: string,
  classId: number,
  payload: SupervisorClassUpdatePayload,
): Promise<SupervisorClassItem> {
  try {
    const response = await apiClient.put<
      ApiSuccessResponse<SupervisorClassItem>
    >(`/v1/supervisor/classes/${classId}/`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(error, "ویرایش کلاس ناموفق بود. لطفاً دوباره تلاش کنید."),
      { cause: error },
    );
  }
}

export async function cancelSupervisorClass(
  accessToken: string,
  classId: number,
): Promise<SupervisorClassItem> {
  try {
    const response = await apiClient.delete<
      ApiSuccessResponse<SupervisorClassItem>
    >(`/v1/supervisor/classes/${classId}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(error, "حذف کلاس ناموفق بود. لطفاً دوباره تلاش کنید."),
      { cause: error },
    );
  }
}
