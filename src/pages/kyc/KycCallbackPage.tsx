import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRefreshMe } from '@/hooks/useRefreshMe'

const ROLE_HOME: Record<string, string> = {
  wholesaler: '/wholesaler/dashboard',
  realtor: '/wholesaler/dashboard',
  buyer: '/buyer/dashboard',
  title_rep: '/title/dashboard',
  admin: '/admin/dashboard',
}

export default function KycCallbackPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const refreshMe = useRefreshMe()

  useEffect(() => {
    refreshMe.mutate(undefined, {
      onSuccess: (fresh) => {
        if (fresh.kycStatus === 'approved') {
          toast.success('Identity verification complete.')
        } else {
          toast.message('Verification update received', {
            description: `Current status: ${fresh.kycStatus}. Final approval may take a moment after you finish.`,
          })
        }
        const home = ROLE_HOME[fresh.role] ?? ROLE_HOME.buyer
        navigate(home, { replace: true })
      },
      onError: () => {
        toast.error('Could not refresh your profile.')
        navigate(user ? (ROLE_HOME[user.role] ?? '/buyer/dashboard') : '/login', { replace: true })
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on landing from Jumio
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card px-10 py-12 shadow-app1-card">
        <Loader2 className="h-10 w-10 animate-spin text-app1-primary" aria-hidden />
        <p className="font-poppins text-sm text-app1-text-muted">Updating your account…</p>
      </div>
    </div>
  )
}
