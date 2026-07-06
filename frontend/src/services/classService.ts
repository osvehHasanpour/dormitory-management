import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  ClassRatingPayload,
  ClassRatingResponse,
  PaginatedClassesData,
  StudentClassItem,
} from "../types/class";

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function fetchActiveClasses(
  accessToken: string,
): Promise<PaginatedClassesData> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<PaginatedClassesData>
    >("/v1/classes/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت کلاس‌های فعال ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function fetchMyClasses(
  accessToken: string,
): Promise<PaginatedClassesData> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<PaginatedClassesData>
    >("/v1/classes/my/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت کلاس‌های ثبت‌نام‌شده ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function fetchMyEndedClasses(
  accessToken: string,
): Promise<PaginatedClassesData> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<PaginatedClassesData>
    >("/v1/classes/my-ended/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت کلاس‌های پایان‌یافته ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function registerClass(
  accessToken: string,
  classId: number,
): Promise<StudentClassItem> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<StudentClassItem>>(
      `/v1/classes/${classId}/register/`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "ثبت‌نام در کلاس ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function cancelClassRegistration(
  accessToken: string,
  classId: number,
): Promise<void> {
  try {
    await apiClient.delete(`/v1/classes/${classId}/register/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "لغو ثبت‌نام کلاس ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      { cause: error },
    );
  }
}

export async function submitClassRating(
  accessToken: string,
  classId: number,
  payload: ClassRatingPayload,
): Promise<ClassRatingResponse> {
  try {
    const response = await apiClient.post<
      ApiSuccessResponse<ClassRatingResponse>
    >(`/v1/classes/${classId}/rate/`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(
      extractApiError(error, "ثبت امتیاز ناموفق بود. لطفاً دوباره تلاش کنید."),
      {
        cause: error,
      },
    );
  }
}
