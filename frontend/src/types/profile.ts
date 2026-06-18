import type { ApiUserProfile } from './auth'

export interface StudentProfile {
  fullName: string
  studentId: string
  blockName: string
  roomNumber: string
}

export interface ProfileInfoField {
  id: string
  label: string
  value: string
}

const UNREGISTERED_VALUE = 'ثبت نشده'

export function mapApiProfileToStudentProfile(profile: ApiUserProfile): StudentProfile {
  const extendedProfile = profile as ApiUserProfile & {
    block_name?: string | null
    room_number?: string | null
  }

  return {
    fullName: `${profile.first_name} ${profile.last_name}`.trim(),
    studentId: profile.personnel_code,
    blockName: extendedProfile.block_name?.trim() || UNREGISTERED_VALUE,
    roomNumber: extendedProfile.room_number?.trim() || UNREGISTERED_VALUE,
  }
}

export function mapStudentProfileToFields(profile: StudentProfile): ProfileInfoField[] {
  return [
    { id: 'full-name', label: 'نام و نام خانوادگی', value: profile.fullName },
    { id: 'student-id', label: 'شماره دانشجویی', value: profile.studentId },
    { id: 'block', label: 'بلوک', value: profile.blockName },
    { id: 'room', label: 'اتاق', value: profile.roomNumber },
  ]
}
