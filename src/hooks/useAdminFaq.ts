import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import type { FaqItem } from '@/hooks/useFaq'

export type CreateFaqInput = {
  question: string
  answer: string
  category: string
  order?: number
  isPublished?: boolean
}

export type UpdateFaqInput = Partial<CreateFaqInput>

export function useAdminFaq() {
  return useQuery({
    queryKey: ['faq', 'admin'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FaqItem[]>>('/faq/admin')
      return res.data.data ?? []
    },
  })
}

export function useCreateFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateFaqInput) => {
      const res = await api.post<ApiResponse<FaqItem>>('/faq', input)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] })
    },
  })
}

export function useUpdateFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateFaqInput & { id: string }) => {
      const res = await api.patch<ApiResponse<FaqItem>>(`/faq/${id}`, input)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] })
    },
  })
}

export function useDeleteFaq() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/faq/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] })
    },
  })
}
