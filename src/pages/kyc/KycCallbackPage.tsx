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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-tract-alabaster font-inter text-tract-obsidian">
      <Loader2 className="h-10 w-10 animate-spin text-tract-green" aria-hidden />
      <p className="text-sm text-gray-500">Updating your account…</p>
    </div>
  )
}
