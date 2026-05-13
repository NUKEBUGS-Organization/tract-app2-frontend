import { z } from 'zod'
import { APP2_STATE_CODES } from '@/lib/constants/states'

const APP2_STATE_ENUM = APP2_STATE_CODES as [string, ...string[]]

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const step2Schema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    dob: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((val) => {
        const date = new Date(val)
        const now = new Date()
        const age = now.getFullYear() - date.getFullYear()
        return age >= 18
      }, 'You must be at least 18 years old'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Enter a valid phone number')
      .regex(/^\d{10,14}$/, 'Enter digits only, no spaces or dashes'),
    stateCode: z.enum(APP2_STATE_ENUM, {
      error: () => ({ message: 'Select a valid state' }),
    }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type Step2FormData = z.infer<typeof step2Schema>

export const verifyOtpSchema = z.object({
  smsCode: z
    .string()
    .min(1, 'SMS code is required')
    .length(6, 'SMS code must be 6 digits')
    .regex(/^\d{6}$/, 'SMS code must contain only digits'),
  emailCode: z
    .string()
    .min(1, 'Email code is required')
    .length(6, 'Email code must be 6 digits')
    .regex(/^\d{6}$/, 'Email code must contain only digits'),
})

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>

const ID_ACCEPT_MIME = ['application/pdf', 'image/jpeg', 'image/png'] as const
const MAX_ID_BYTES = 10 * 1024 * 1024

export const kycOnboardingSchema = z
  .object({
    idFile: z.custom<File | undefined>((v) => v === undefined || v instanceof File),
    faceVerified: z.boolean(),
    bankLinked: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!(data.idFile instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['idFile'],
        message: 'Please upload your ID',
      })
      return
    }
    const f = data.idFile
    if (f.size > MAX_ID_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['idFile'],
        message: 'File must be 10MB or less',
      })
    }
    const extOk = /\.(pdf|jpe?g|png)$/i.test(f.name)
    const mimeOk = ID_ACCEPT_MIME.includes(f.type as (typeof ID_ACCEPT_MIME)[number])
    if (!mimeOk && !extOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['idFile'],
        message: 'PDF, JPG, or PNG only',
      })
    }
    if (!data.faceVerified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['faceVerified'],
        message: 'Complete live selfie verification',
      })
    }
    if (!data.bankLinked) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bankLinked'],
        message: 'Link your bank account',
      })
    }
  })

export type KycOnboardingFormData = z.infer<typeof kycOnboardingSchema>
