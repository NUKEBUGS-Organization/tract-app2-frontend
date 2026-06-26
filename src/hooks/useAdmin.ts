import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface AdminStats {
  pendingReview: number
  activeDeals: number
  flaggedPenalties: number
  totalUsers: number
  platformRevenue: number
  liveListings: number
}

export interface PendingListing {
  id: string
  propertyAddress: string
  city: string
  stateCode: string
  wholesalerName: string
  submittedAt: string
  outlierFlagged: boolean
  flagLabel: string
  arv: number
  rehabTotal: number
}

export interface RecentPenalty {
  id: string
  userId: string
  userName: string
  violationType: string
  violationLabel: string
  scoreDeduction: number
  createdAt: string
  resolved: boolean
  banApplied: boolean
}

export interface AdminDashboardData {
  stats: AdminStats
  pendingListings: PendingListing[]
  recentPenalties: RecentPenalty[]
}

export interface PendingUser {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  stateCode: string
  kycStatus: string
  bankVerified: boolean
  pofStatus?: string
  pofDocumentUrl?: string | null
  pofDocumentType?: string | null
  pofSubmittedAt?: string | null
  createdAt: string
  licenseNumber?: string | null
  brokerageName?: string | null
}

export interface PenaltyDetail {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  violationType: string
  violationLabel: string
  scoreDeduction: number
  automatedPenalties: string[]
  banApplied: boolean
  banExpiresAt: string | null
  resolved: boolean
  resolvedAt: string | null
  resolutionNotes: string
  dealId: string | null
  listingId: string | null
  createdAt: string
}

export interface FlaggedMessage {
  id: string
  dealId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  flagType: string
  flagLabel: string
  createdAt: string
  isBlocked?: boolean
}

export interface LedgerEntry {
  id: string
  fullName: string
  email: string
  role: string
  totalPaid: number
  dealsClosed: number
  lastActiveAt: string | null
}

export interface FinancialLedgerData {
  entries: LedgerEntry[]
  summary: {
    totalRevenue: number
    closedDeals: number
    averageFee: number
    feePayerCount: number
  }
  page: number
  pages: number
  total: number
}

export function useAdminDashboard() {
  return useQuery<AdminDashboardData>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard')
      return data.data
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 2,
  })
}

export function useVerificationQueue() {
  return useQuery<PendingUser[]>({
    queryKey: ['admin', 'verification-queue'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PendingUser[]>>('/admin/verification-queue')
      return data.data
    },
    staleTime: 30_000,
  })
}

export function useReviewKyc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) => {
      const { data } = await api.post<ApiResponse<{ id: string; kycStatus: string; message: string }>>(
        `/admin/verification-queue/${userId}/review`,
        { action },
      )
      return data.data
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verification-queue'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success(`KYC ${vars.action}d successfully.`)
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to update KYC status.')
    },
  })
}

export function usePenaltyLog(page = 1, limit = 20) {
  return useQuery<{ penalties: PenaltyDetail[]; total: number; page: number; pages: number }>({
    queryKey: ['admin', 'penalties', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ penalties: PenaltyDetail[]; total: number; page: number; pages: number }>>(
        '/admin/penalties',
        { params: { page, limit } },
      )
      return data.data
    },
    staleTime: 30_000,
  })
}

export function useResolvePenalty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ penaltyId, notes }: { penaltyId: string; notes?: string }) => {
      const { data } = await api.post<ApiResponse<{ id: string; resolved: boolean; resolvedAt: string | null }>>(
        `/admin/penalties/${penaltyId}/resolve`,
        { notes },
      )
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'penalties'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success('Penalty resolved.')
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to resolve penalty.')
    },
  })
}

export function useFlaggedMessages(page = 1, limit = 20) {
  return useQuery<{ messages: FlaggedMessage[]; total: number; page: number; pages: number }>({
    queryKey: ['admin', 'chat-flagged', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ messages: FlaggedMessage[]; total: number; page: number; pages: number }>>(
        '/admin/chat/flagged',
        { params: { page, limit } },
      )
      return data.data
    },
    staleTime: 30_000,
  })
}

export function useFinancialLedger(page = 1, limit = 20) {
  return useQuery<FinancialLedgerData>({
    queryKey: ['admin', 'financial-ledger', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FinancialLedgerData>>('/admin/financial-ledger', {
        params: { page, limit },
      })
      return data.data
    },
    staleTime: 60_000,
  })
}

export function useReviewListing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ listingId, action, reason }: { listingId: string; action: 'approve' | 'reject'; reason?: string }) => {
      const { data } = await api.post<ApiResponse<{ id: string; status: string; message: string }>>(
        `/admin/listings/${listingId}/review`,
        { action, reason },
      )
      return data.data
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      toast.success(`Listing ${vars.action}d successfully.`)
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to review listing.')
    },
  })
}

export function useReassignTitleRep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ dealId, titleRepId }: { dealId: string; titleRepId: string }) => {
      const { data } = await api.post(`/deals/${dealId}/reassign-title-rep`, { titleRepId })
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'all-deals'] })
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast.success('Title rep reassigned.')
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to reassign title rep.')
    },
  })
}

export function useAdminTitleReps() {
  return useQuery({
    queryKey: ['admin', 'title-reps'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users?role=title_rep')
      return (data.data ?? []) as Array<{
        id: string
        fullName: string
        email: string
      }>
    },
  })
}

export function useBanUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      permanent,
      durationDays,
    }: {
      userId: string
      reason: string
      permanent: boolean
      durationDays?: number
    }) => {
      const { data } = await api.post(`/admin/users/${userId}/ban`, { reason, permanent, durationDays })
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('User banned successfully.')
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to ban user.')
    },
  })
}
