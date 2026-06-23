import { z } from 'zod'

const today = new Date()
today.setHours(0, 0, 0, 0)

export const createBidSchema = z.object({
  assignmentPrice: z.coerce
    .number({
      error: () => ({ message: 'Enter a valid price' }),
    })
    .min(1, 'Bid price is required'),

  emdAmount: z.coerce
    .number({
      error: () => ({ message: 'Enter a valid amount' }),
    })
    .min(0, 'EMD cannot be negative')
    .optional()
    .default(0),

  proposedClosingDate: z
    .string()
    .min(1, 'Closing date is required')
    .refine((val) => {
      const date = new Date(val)
      return date > today
    }, 'Closing date must be in the future'),

  inspectionDays: z.coerce.number().int().min(3, 'Minimum 3 days').max(30, 'Maximum 30 days').optional().default(7),

  specialTerms: z.string().optional(),
})

export type CreateBidFormData = z.infer<typeof createBidSchema>
