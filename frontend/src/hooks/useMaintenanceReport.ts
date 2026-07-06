import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from './useAuth'
import { useRoomAssignment } from './useRoomAssignment'
import { submitMaintenanceReport } from '../services/maintenanceService'
import type { MaintenanceReportFormValues } from '../types/maintenance'
import { isRoomCategory } from '../types/maintenance'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const maintenanceReportSchema = z
  .object({
    blockId: z.string().min(1, 'انتخاب بلوک الزامی است.'),
    roomNumber: z.string().max(20, 'شماره اتاق نمی‌تواند بیش از ۲۰ کاراکتر باشد.'),
    category: z.string().min(1, 'انتخاب دسته‌بندی خرابی الزامی است.'),
    description: z
      .string()
      .min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد.')
      .max(1000, 'توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد.'),
    photo: z
      .instanceof(File)
      .nullable()
      .refine(
        (file) => !file || file.size <= MAX_PHOTO_SIZE,
        'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.',
      ),
  })
  .superRefine((values, ctx) => {
    if (isRoomCategory(values.category) && !values.roomNumber.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['roomNumber'],
        message: 'شماره اتاق الزامی است.',
      })
    }
  })

interface MaintenanceSubmitContext {
  blockName: string
}

interface UseMaintenanceReportResult {
  form: ReturnType<typeof useForm<MaintenanceReportFormValues>>
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  profileError: string | null
  isProfileLoading: boolean
  submitReport: (
    values: MaintenanceReportFormValues,
    context: MaintenanceSubmitContext,
  ) => Promise<void>
  clearMessages: () => void
}

export function useMaintenanceReport(): UseMaintenanceReportResult {
  const navigate = useNavigate()
  const { tokens, isAuthenticated } = useAuth()
  const { roomNumber, isLoading: isProfileLoading, error: profileError } = useRoomAssignment()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<MaintenanceReportFormValues>({
    resolver: zodResolver(maintenanceReportSchema),
    defaultValues: {
      blockId: '',
      roomNumber: '',
      category: '',
      description: '',
      photo: null,
    },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (roomNumber) {
      form.setValue('roomNumber', roomNumber, { shouldValidate: true })
    }
  }, [roomNumber, form])

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const submitReport = async (
    values: MaintenanceReportFormValues,
    context: MaintenanceSubmitContext,
  ) => {
    clearMessages()

    if (!isAuthenticated || !tokens?.access) {
      setError('برای ثبت گزارش خرابی باید وارد سامانه شوید.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitMaintenanceReport(values, tokens.access, context.blockName)
      setSuccessMessage('گزارش خرابی با موفقیت ثبت شد.')
      form.reset({
        blockId: '',
        roomNumber: roomNumber ?? '',
        category: '',
        description: '',
        photo: null,
      })
      window.setTimeout(() => {
        navigate('/my-requests', { replace: true })
      }, 900)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'ثبت گزارش خرابی ناموفق بود. لطفاً دوباره تلاش کنید.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    error,
    successMessage,
    profileError,
    isProfileLoading,
    submitReport,
    clearMessages,
  }
}
