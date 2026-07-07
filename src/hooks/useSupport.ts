import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TicketMessage {
  senderId: string
  senderRole: string
  body: string
  createdAt: string
}

export interface SupportTicket {
  id: string
  userId: string
  userRole: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assignedTo: string | null
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

export interface CreateTicketInput {
  subject: string
  description: string
  priority?: TicketPriority
}

export interface UpdateTicketInput {
  status?: TicketStatus
  assignedTo?: string
  reply?: string
}

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SupportTicket[]>>('/tickets')
      return res.data.data ?? []
    },
  })
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['tickets', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<SupportTicket>>(`/tickets/${id}`)
      return res.data.data
    },
  })
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const res = await api.post<ApiResponse<SupportTicket>>('/tickets', input)
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tickets'] })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateTicketInput) => {
      const res = await api.patch<ApiResponse<SupportTicket>>(`/tickets/${id}`, input)
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tickets'] })
      void qc.invalidateQueries({ queryKey: ['tickets', id] })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useClaimTicket(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch<ApiResponse<SupportTicket>>(`/tickets/${id}/claim`)
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tickets'] })
      void qc.invalidateQueries({ queryKey: ['tickets', id] })
    },
  })
}
