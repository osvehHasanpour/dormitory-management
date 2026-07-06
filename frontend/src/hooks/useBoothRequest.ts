import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from './useAuth'
import { submitBoothRequest } from '../services/boothService'
import type { BoothRequestFormValues } from '../types/booth'

const boothRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان غرفه الزامی است.')
    .max(200, 'عنوان غرفه نمی‌تواند بیش از ۲۰۰ کاراکتر باشد.'),
  category: z.string().min(1, 'انتخاب دسته‌بندی محصولات الزامی است.'),
  tableCount: z.string().min(1, 'انتخاب تعداد میز الزامی است.'),
  description: z.string().max(1000, 'توضیحات نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد.'),
})

interface UseBoothRequestResult {
  form: ReturnType<typeof useForm<BoothRequestFormValues>>
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  submitRequest: (values: BoothRequestFormValues) => Promise<void>
  clearMessages: () => void
}

export function useBoothRequest(): UseBoothRequestResult {
  const navigate = useNavigate()
  const { tokens, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<BoothRequestFormValues>({
    resolver: zodResolver(boothRequestSchema),
    defaultValues: {
      title: '',
      category: '',
      tableCount: '',
      description: '',
    },
    mode: 'onTouched',
  })

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const submitRequest = async (values: BoothRequestFormValues) => {
    clearMessages()

    if (!isAuthenticated || !tokens?.access) {
      setError('برای ثبت درخواست غرفه باید وارد سامانه شوید.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitBoothRequest(values, tokens.access)
      setSuccessMessage('درخواست غرفه با موفقیت ثبت شد.')
      form.reset()
      window.setTimeout(() => {
        navigate('/my-requests', { replace: true })
      }, 900)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'ثبت درخواست غرفه ناموفق بود. لطفاً دوباره تلاش کنید.',
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
    submitRequest,
    clearMessages,
  }
}
