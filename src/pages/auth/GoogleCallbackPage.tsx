import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api, { bootRefreshAccessToken } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { roleHomePath } from '@/lib/roleHome'
import type { ApiResponse, User } from '@/types'

/** Lands here after the backend sets the refreshToken cookie for an existing-user Google login. */
export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const setAuthReady = useAuthStore((s) => s.setAuthReady)

  useEffect(() => {
    ;(async () => {
      try {
        const token = await bootRefreshAccessToken()
        if (!token) {
          toast.error('Google sign-in did not complete. Please try again.')
          navigate('/login', { replace: true })
          return
        }
        setToken(token)
        const res = await api.get<ApiResponse<User>>('/auth/me')
        const user = res.data?.data
        if (!user?.id) {
          toast.error('Could not load your profile. Please sign in again.')
          navigate('/login', { replace: true })
          return
        }
        setUser(user)
        setAuthReady(true)
        toast.success('Signed in with Google.')
        navigate(roleHomePath(user.role), { replace: true })
      } catch {
        toast.error('Google sign-in failed. Please try again.')
        navigate('/login', { replace: true })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on landing from Google redirect
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card px-10 py-12 shadow-app1-card">
        <Loader2 className="h-10 w-10 animate-spin text-app1-primary" aria-hidden />
        <p className="font-poppins text-sm text-app1-text-muted">Signing you in with Google…</p>
      </div>
    </div>
  )
}
