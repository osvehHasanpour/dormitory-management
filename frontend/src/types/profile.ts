import type { LucideIcon } from 'lucide-react'
import { Building2, DoorOpen, IdCard, UserCircle } from 'lucide-react'

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
  icon: LucideIcon
}

const UNREGISTERED_VALUE = 'ثبت نشده'

function formatFieldValue(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : UNREGISTERED_VALUE
}

export function mapApiProfileToStudentProfile(profile: ApiUserProfile): StudentProfile {
  return {
    fullName: `${profile.first_name} ${profile.last_name}`.trim() || UNREGISTERED_VALUE,
    studentId: formatFieldValue(profile.personnel_code),
    blockName: formatFieldValue(profile.block_name),
    roomNumber: formatFieldValue(profile.room_number),
  }
}

export function mapStudentProfileToFields(profile: StudentProfile): ProfileInfoField[] {
  return [
    { id: 'full-name', label: 'نام و نام خانوادگی', value: profile.fullName, icon: UserCircle },
    { id: 'student-id', label: 'شماره دانشجویی', value: profile.studentId, icon: IdCard },
    { id: 'block', label: 'بلوک', value: profile.blockName, icon: Building2 },
    { id: 'room', label: 'اتاق', value: profile.roomNumber, icon: DoorOpen },
  ]
}
