import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from './useAuth'
import { submitMaintenanceReport } from '../services/maintenanceService'
import type { MaintenanceReportFormValues } from '../types/maintenance'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

const maintenanceReportSchema = z.object({
  block: z.string().min(1, 'انتخاب بلوک الزامی است.'),
  roomNumber: z
    .string()
    .min(1, 'شماره اتاق الزامی است.')
    .max(20, 'شماره اتاق نمی‌تواند بیش از ۲۰ کاراکتر باشد.'),
  category: z.string().min(1, 'انتخاب دسته‌بندی خرابی الزامی است.'),
  description: z
    .string()
    .min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد.')
    .max(1000, 'توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد.'),
  photo: z
    .instanceof(File)
    .nullable()
    .refine((file) => !file || file.size <= MAX_PHOTO_SIZE, 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.'),
})

interface UseMaintenanceReportResult {
  form: ReturnType<typeof useForm<MaintenanceReportFormValues>>
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  submitReport: (values: MaintenanceReportFormValues) => Promise<void>
  clearMessages: () => void
}

export function useMaintenanceReport(): UseMaintenanceReportResult {
  const navigate = useNavigate()
  const { tokens, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<MaintenanceReportFormValues>({
    resolver: zodResolver(maintenanceReportSchema),
    defaultValues: {
      block: '',
      roomNumber: '',
      category: '',
      description: '',
      photo: null,
    },
    mode: 'onTouched',
  })

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const submitReport = async (values: MaintenanceReportFormValues) => {
    clearMessages()

    if (!isAuthenticated || !tokens?.access) {
      setError('برای ثبت گزارش خرابی باید وارد سامانه شوید.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitMaintenanceReport(values, tokens.access)
      setSuccessMessage('گزارش خرابی با موفقیت ثبت شد.')
      form.reset()
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
    submitReport,
    clearMessages,
  }
}
