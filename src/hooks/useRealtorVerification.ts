import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export type RealtorVerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

export type RealtorVerification = {
  id?: string
  status: RealtorVerificationStatus
  stateLicenseNumber?: string | null
  brokerageName?: string | null
  managingBroker?: string | null
  officeAddress?: string | null
  rejectionReason?: string | null
  submittedAt?: string | null
}

export type PendingRealtorVerification = RealtorVerification & {
  id: string
  user: {
    id: string
    fullName: string
    email: string
    role: string
    phone: string
    stateCode: string
  } | null
}

export type SubmitRealtorVerificationBody = {
  state_license_number: string
  brokerage_name: string
  managing_broker: string
  office_address: string
}

export function useMyRealtorVerification(enabled = true) {
  return useQuery({
    queryKey: ['verifications', 'me'],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RealtorVerification>>('/verifications/me')
      return data.data
    },
    staleTime: 15_000,
  })
}

export function useSubmitRealtorVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: SubmitRealtorVerificationBody) => {
      const { data } = await api.post<ApiResponse<RealtorVerification>>('/verifications/realtor', body)
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['verifications'] })
      toast.success('Credentials submitted for admin review.')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to submit verification.'
      toast.error(message)
    },
  })
}

export function usePendingRealtorVerifications(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'verifications', 'pending'],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PendingRealtorVerification[]>>(
        '/admin/verifications/pending',
      )
      return data.data
    },
    staleTime: 15_000,
  })
}

export function useApproveRealtorVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/admin/verifications/${id}/approve`)
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verification-queue'] })
      toast.success('Realtor verification approved.')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to approve verification.'
      toast.error(message)
    },
  })
}

export function useRejectRealtorVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.post(`/admin/verifications/${id}/reject`, { reason })
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verification-queue'] })
      toast.success('Realtor verification rejected.')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to reject verification.'
      toast.error(message)
    },
  })
}
