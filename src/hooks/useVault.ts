import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'

export interface VaultDoc {
  _id: string
  dealId: string
  uploadedBy: {
    _id: string
    fullName: string
    role: string
  }
  fileName: string
  fileUrl: string
  fileType: string
  visibleTo: string
  createdAt: string
}

export function useVaultDocs(dealId?: string) {
  return useQuery({
    queryKey: ['vault', dealId],
    queryFn: async () => {
      const res = await api.get(`/deals/${dealId}/vault`)
      return res.data.data as VaultDoc[]
    },
    enabled: !!dealId,
  })
}

export function useUploadVaultDoc(dealId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      fileName: string
      fileUrl: string
      fileType?: string
      visibleTo?: string
    }) => {
      const res = await api.post(`/deals/${dealId}/vault`, payload)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', dealId] })
      toast.success('Document uploaded.')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Upload failed.')
    },
  })
}

export function useDeleteVaultDoc(dealId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (docId: string) => {
      const res = await api.delete(`/deals/${dealId}/vault/${docId}`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', dealId] })
      toast.success('Document removed.')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Delete failed.')
    },
  })
}
