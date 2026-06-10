import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'

async function downloadPdf(url: string, filename: string): Promise<void> {
  const token = useAuthStore.getState().accessToken ?? localStorage.getItem('tract_access_token')
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
  })

  if (!res.ok) {
    throw new Error(`PDF generation failed: ${res.status}`)
  }

  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(blobUrl)
}

export function useContractPdf(dealId?: string) {
  return async () => {
    if (!dealId) {
      toast.error('Deal ID not found.')
      return
    }
    try {
      toast.info('Generating PDF...')
      await downloadPdf(`${API_BASE}/pdf/contract/${dealId}`, `contract-${dealId.slice(-6)}.pdf`)
      toast.success('Contract PDF downloaded.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF.')
    }
  }
}

export function useEmdPdf(dealId?: string) {
  return async () => {
    if (!dealId) {
      toast.error('Deal ID not found.')
      return
    }
    try {
      toast.info('Generating PDF...')
      await downloadPdf(`${API_BASE}/pdf/emd/${dealId}`, `emd-instructions-${dealId.slice(-6)}.pdf`)
      toast.success('EMD instructions PDF downloaded.')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF.')
    }
  }
}
