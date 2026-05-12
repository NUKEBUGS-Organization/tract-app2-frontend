import { z } from 'zod'

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

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

export { US_STATES }

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
    stateCode: z.string().min(1, 'Please select your state'),
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
