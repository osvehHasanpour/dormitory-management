import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  MaintenanceReportFormValues,
  MaintenanceReportResponse,
} from "../types/maintenance";
import { isRoomCategory } from "../types/maintenance";

function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "ثبت گزارش خرابی ناموفق بود. لطفاً دوباره تلاش کنید.";
}

export async function submitMaintenanceReport(
  values: MaintenanceReportFormValues,
  accessToken: string,
  blockName: string,
): Promise<MaintenanceReportResponse> {
  const formData = new FormData();
  const location = isRoomCategory(values.category)
    ? `${blockName} - اتاق ${values.roomNumber}`
    : blockName;

  formData.append("location", location);
  formData.append("description", values.description);
  formData.append("category", values.category);

  if (values.photo) {
    formData.append("photo_url", values.photo);
  }

  try {
    const response = await apiClient.post<
      ApiSuccessResponse<MaintenanceReportResponse>
    >("/v1/requests/maintenance/", formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(extractApiError(error), { cause: error });
  }
}
