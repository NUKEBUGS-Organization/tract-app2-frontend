import { z } from 'zod'
import { APP2_STATE_CODES } from '@/lib/constants/states'

const APP2_STATE_ENUM = APP2_STATE_CODES as [string, ...string[]]

export const createListingSchema = z
  .object({
    dealType: z.enum(['fix_flip', 'hold_sell', 'full_gut', 'new_construction'], {
      error: () => ({ message: 'Deal type is required' }),
    }),

    marketStatus: z.enum(['off_market', 'on_market']).default('off_market'),

    propertyAddress: z.string().min(5, 'Property address is required'),
    city: z.string().min(2, 'City is required'),
    stateCode: z.enum(APP2_STATE_ENUM, {
      error: () => ({ message: 'Select a valid state' }),
    }),
    zipCode: z.string().regex(/^\d{5}$/, 'Enter a valid 5-digit ZIP'),

    arv: z.number().min(1, 'ARV is required'),
    rehabTotal: z.number().min(0, 'Enter rehab cost'),
    purchasePrice: z.number().min(1, 'Purchase price is required'),
    estimatedHoldingCosts: z.number().min(0, 'Enter holding costs'),

    assignmentFeeLow: z.number().min(1, 'Minimum fee is required'),
    assignmentFeeHigh: z.number().min(1, 'Maximum fee is required'),
  })
  .refine((d) => d.assignmentFeeHigh >= d.assignmentFeeLow, {
    message: 'Max fee must be ≥ min fee',
    path: ['assignmentFeeHigh'],
  })

export type CreateListingFormData = z.infer<typeof createListingSchema>
