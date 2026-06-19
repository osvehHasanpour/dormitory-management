export type UserRole = 'student' | 'supervisor' | 'admin'

export interface AuthUser {
  id: number
  personnel_code: string
  first_name: string
  last_name: string
  role: UserRole
  full_name: string
  is_active: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginRequestPayload {
  personnel_code: string
  password: string
}

export interface ApiUserProfile {
  id: number
  personnel_code: string
  first_name: string
  last_name: string
  role_name: UserRole | null
  block_name: string | null
  room_number: string | null
  is_active: boolean
}

export interface LoginResponseData {
  access: string
  refresh: string
  user: ApiUserProfile
}

export interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors: Record<string, string[] | string>
}

export interface AuthTokens {
  access: string
  refresh: string
}

export function mapApiUserToAuthUser(user: ApiUserProfile): AuthUser {
  return {
    id: user.id,
    personnel_code: user.personnel_code,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role_name ?? 'student',
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    is_active: user.is_active,
  }
}

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case 'supervisor':
      return '/supervisor/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/dashboard'
  }
}
