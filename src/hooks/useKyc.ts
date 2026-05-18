import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface InitiateKycResponse {
  kyc_access_token: string
}

export function useInitiateKyc() {
  return useMutation({
    mutationFn: async (): Promise<InitiateKycResponse> => {
      const res = await api.post<ApiResponse<InitiateKycResponse>>('/auth/kyc/initiate')
      return res.data.data
    },
  })
}
