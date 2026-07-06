import axios from "axios";

import apiClient from "./apiClient";
import type { ApiSuccessResponse } from "../types/auth";

export interface Block {
  id: number;
  name: string;
  total_floors?: number;
}

export interface Floor {
  id: number;
  floor: number;
  label: string;
}

interface BlocksResponse {
  results: Block[];
}

interface FloorsResponse {
  results: Floor[];
}

function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function unwrapResults<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}

export async function fetchBlocks(accessToken: string): Promise<Block[]> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<Block[] | BlocksResponse>
    >("/v1/blocks/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return unwrapResults(response.data.data);
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت لیست بلوک‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      {
        cause: error,
      },
    );
  }
}

export async function fetchFloors(
  blockId: string,
  accessToken: string,
): Promise<Floor[]> {
  try {
    const response = await apiClient.get<
      ApiSuccessResponse<Floor[] | FloorsResponse>
    >(`/v1/blocks/${blockId}/floors/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return unwrapResults(response.data.data);
  } catch (error) {
    throw new Error(
      extractApiError(
        error,
        "دریافت لیست طبقات ناموفق بود. لطفاً دوباره تلاش کنید.",
      ),
      {
        cause: error,
      },
    );
  }
}
