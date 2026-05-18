import { CheckCircle2, ExternalLink, Loader2, Shield, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useInitiateKyc } from '@/hooks/useKyc'
import { useRefreshMe } from '@/hooks/useRefreshMe'

/** Web SDK datacenter for amer-1 API hosts (`auth.amer-1.jumio.ai`). See @jumio/websdk README. */
const JUMIO_DC = 'us'

type Props = {
  /** Onboarding variant uses slightly different copy */
  variant?: 'onboarding' | 'settings'
  className?: string
}

export default function KycVerificationPanel({ variant = 'settings', className }: Props) {
  const user = useAuthStore((s) => s.user)
  const initiate = useInitiateKyc()
  const refreshMe = useRefreshMe()
  const [sdkToken, setSdkToken] = useState<string | null>(null)
  const [sdkLoading, setSdkLoading] = useState(false)

  const status = user?.kycStatus ?? 'pending'
  const approved = status === 'approved'
  const inProgress = status === 'in_progress'

  useEffect(() => {
    if (!sdkToken) return undefined

    const onSuccess = () => {
      toast.success('Verification submitted.')
      setSdkToken(null)
      refreshMe.mutate()
    }
    const onFailed = () => {
      toast.error('Verification could not be completed.')
      setSdkToken(null)
    }

    window.addEventListener('workflow:success', onSuccess)
    window.addEventListener('workflow:failed', onFailed)
    return () => {
      window.removeEventListener('workflow:success', onSuccess)
      window.removeEventListener('workflow:failed', onFailed)
    }
  }, [sdkToken, refreshMe])

  const startVerification = () => {
    initiate.mutate(undefined, {
      onSuccess: async ({ kyc_access_token }) => {
        if (!kyc_access_token) {
          toast.error('No verification token returned from server.')
          return
        }
        try {
          setSdkLoading(true)
          await import('@jumio/websdk/assets/style.css')
          await import('@jumio/websdk')
          setSdkToken(kyc_access_token)
          toast.message('Complete verification below', {
            description: 'Grant camera access when prompted. You can close this panel when finished.',
          })
        } catch {
          toast.error('Could not load verification UI. Try again.')
        } finally {
          setSdkLoading(false)
        }
      },
      onError: () => {
        toast.error('Could not start verification. Check Jumio credentials and try again.')
      },
    })
  }

  const busy = initiate.isPending || sdkLoading

  return (
    <>
      {sdkToken ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white">
          <header className="flex shrink-0 items-center justify-end gap-2 border-b border-black/10 px-4 py-3">
            <button
              type="button"
              onClick={() => setSdkToken(null)}
              className="inline-flex h-10 items-center gap-2 rounded-lg px-4 font-inter text-[13px] font-semibold text-tract-obsidian hover:bg-black/5"
            >
              <X className="h-4 w-4" aria-hidden /> Close
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto">
            <jumio-sdk dc={JUMIO_DC} token={sdkToken} className="block min-h-full w-full" />
          </div>
        </div>
      ) : null}

      <section
        className={cn(
          'rounded-xl border border-black/5 bg-white p-8 shadow-sm',
          className,
        )}
      >
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tract-green-light text-tract-green">
            <Shield className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-playfair text-[22px] font-bold text-tract-obsidian">
              Identity verification (Jumio)
            </h2>
            <p className="mt-2 font-inter text-[14px] text-gray-500">
              {variant === 'onboarding'
                ? 'Government ID and selfie verification through Jumio. You can finish later in Profile if you skip now.'
                : 'Government ID and selfie verification through Jumio. Required before listing properties, bidding, deal actions, and in-deal chat.'}
            </p>
            <p className="mt-3 font-inter text-[13px] text-gray-400">
              Status:{' '}
              <strong className="text-tract-obsidian capitalize">{status.replace('_', ' ')}</strong>
              {inProgress ? ' — finish or retry in the Jumio window if it did not complete.' : null}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {approved ? (
                <span className="inline-flex items-center gap-2 font-inter text-[14px] font-semibold text-tract-green">
                  <CheckCircle2 className="h-5 w-5" aria-hidden /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={startVerification}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-tract-green px-6 font-inter text-[12px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Starting…
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" aria-hidden /> Start verification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
