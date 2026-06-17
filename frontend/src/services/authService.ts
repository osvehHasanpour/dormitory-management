import axios from 'axios'

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthTokens,
  AuthUser,
  LoginCredentials,
  LoginRequestPayload,
  LoginResponseData,
} from '../types/auth'
import { mapApiUserToAuthUser } from '../types/auth'
import apiClient from './apiClient'

export interface LoginResult {
  tokens: AuthTokens
  user: AuthUser
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return 'ورود ناموفق بود. لطفاً دوباره تلاش کنید.'
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const payload: LoginRequestPayload = {
    personnel_code: credentials.username.trim(),
    password: credentials.password,
  }

  try {
    const response = await apiClient.post<ApiSuccessResponse<LoginResponseData>>(
      '/v1/auth/login/',
      payload,
    )

    const { access, refresh, user } = response.data.data

    return {
      tokens: { access, refresh },
      user: mapApiUserToAuthUser(user),
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error })
  }
}
