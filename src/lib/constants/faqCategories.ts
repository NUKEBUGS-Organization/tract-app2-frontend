// CANONICAL SOURCE:
// tract-app2-backend/src/common/constants/
// faq-categories.ts
// Sync manually when categories change.
export const FAQ_CATEGORIES = [
  'Account & Verification',
  'Transaction Fees & Payments',
  'Bidding & Closing Process',
  'Shared Platform Mechanics & Security',
] as const

export type FaqCategory =
  typeof FAQ_CATEGORIES[number]
