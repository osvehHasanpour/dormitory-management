import axios from "axios";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiUserProfile,
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginRequestPayload,
  LoginResponseData,
} from "../types/auth";
import { mapApiUserToAuthUser } from "../types/auth";
import apiClient from "./apiClient";

export interface LoginResult {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface RefreshTokensResult {
  access: string;
  refresh?: string;
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  return "ورود ناموفق بود. لطفاً دوباره تلاش کنید.";
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const payload: LoginRequestPayload = {
    personnel_code: credentials.username.trim(),
    password: credentials.password,
  };

  try {
    const response = await apiClient.post<
      ApiSuccessResponse<LoginResponseData>
    >("/v1/auth/login/", payload);

    const { access, refresh, user } = response.data.data;

    return {
      tokens: { access, refresh },
      user: mapApiUserToAuthUser(user),
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
}

export async function refreshTokens(
  refreshToken: string,
): Promise<RefreshTokensResult> {
  try {
    const response = await apiClient.post<
      ApiSuccessResponse<Record<string, unknown>>
    >("/v1/auth/token/refresh/", { refresh: refreshToken });

    const data = response.data.data;
    const access = typeof data.access === "string" ? data.access : "";
    const refresh = typeof data.refresh === "string" ? data.refresh : undefined;

    if (!access.trim()) {
      throw new Error("توکن دسترسی جدید دریافت نشد.");
    }

    return { access, refresh };
  } catch (error) {
    throw new Error(
      extractErrorMessage(error) || "تازه‌سازی توکن ناموفق بود.",
      { cause: error },
    );
  }
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  try {
    await apiClient.post<ApiSuccessResponse<Record<string, never>>>(
      "/v1/auth/logout/",
      { refresh: refreshToken },
    );
  } catch {
    // Best-effort: local logout should still succeed even if API fails.
  }
}

function extractProfileErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  return "دریافت پروفایل ناموفق بود. لطفاً دوباره تلاش کنید.";
}

export async function getProfile(accessToken: string): Promise<ApiUserProfile> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<ApiUserProfile>>(
      "/v1/auth/profile/",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(extractProfileErrorMessage(error), { cause: error });
  }
}
