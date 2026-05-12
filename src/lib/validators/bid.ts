import { z } from 'zod'

export const createBidSchema = z.object({
  assignmentPrice: z.coerce
    .number({ error: () => ({ message: 'Enter a valid price' }) })
    .min(1, 'Bid price is required'),
  specialTerms: z.string().optional(),
})

export type CreateBidFormData = z.infer<typeof createBidSchema>
