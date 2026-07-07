import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export function useFaq() {
  return useQuery({
    queryKey: ['faq'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FaqItem[]>>('/faq')
      return res.data.data ?? []
    },
    staleTime: 5 * 60_000,
  })
}
