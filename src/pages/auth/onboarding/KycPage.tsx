import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  Building2,
  Camera,
  Check,
  IdCard,
  Loader2,
  Lock,
  Square,
  Upload,
  UserCircle,
} from 'lucide-react'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import { cn } from '@/lib/utils'
import { kycOnboardingSchema, type KycOnboardingFormData } from '@/lib/validators/auth'

const SELFIE_PLACEHOLDER_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDVHTXe9h8jIDcQTqc783Ew-EdB9ZDLuQq89WxqibZAydfJzxx8lNcvOMId1OYC2uc0qyArjYl7FnDy3pvba0Jxn2nDAbA0LAKXRr6KDunVUbq0eYPJDg5WnwtdcnCPfYAx5F8O5_rEVmlhvEfbmm1tjpeWmVJZ49rE0zz5wlGMQuFPmY110LrZw_VaRVOaOu6ePVBGZ1rslXEgOu0fCXUj5DMXyZWMjMcivXr3tn-KPzX-9LKONVDsU2XxXpJkDSLe_cx_S0Cgpds'

function StatusItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        done ? 'text-tract-green' : 'text-gray-400/60',
      )}
    >
      {done ? (
        <Check className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <Square className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
      )}
      <span className="font-inter text-[13px]">{label}</span>
    </div>
  )
}

export default function KycPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<KycOnboardingFormData>({
    resolver: zodResolver(kycOnboardingSchema),
    defaultValues: {
      idFile: undefined,
      faceVerified: false,
      bankLinked: false,
    },
  })

  const idFile = watch('idFile')
  const faceVerified = watch('faceVerified')
  const bankLinked = watch('bankLinked')

  const uploadIdMutation = useMutation({
    mutationFn: async (file: File) => {
      // TODO: implement POST /users/me/kyc/id-document when Jumio integration is ready
      await new Promise((resolve) => setTimeout(resolve, 800))
      return file
    },
  })

  const faceMutation = useMutation({
    mutationFn: async () => {
      // TODO: implement POST /users/me/kyc/selfie-session when Jumio integration is ready
      await new Promise((resolve) => setTimeout(resolve, 800))
    },
    onSuccess: () => {
      setValue('faceVerified', true, { shouldValidate: true })
    },
  })

  const bankMutation = useMutation({
    mutationFn: async () => {
      // TODO: implement Plaid Link widget when Plaid integration is ready
      await new Promise((resolve) => setTimeout(resolve, 800))
    },
    onSuccess: () => {
      setValue('bankLinked', true, { shouldValidate: true })
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      // TODO: implement POST /users/me/kyc/complete when Jumio integration is ready
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
    onSuccess: () => {
      navigate('/register/bank')
    },
    onError: () => {
      toast.error('Could not complete verification. Try again.')
    },
  })

  const idDocumentReady = uploadIdMutation.isSuccess && idFile instanceof File

  const queueIdUpload = (file: File) => {
    setValue('idFile', file, { shouldValidate: true })
    uploadIdMutation.mutate(file, {
      onError: () => {
        setValue('idFile', undefined, { shouldValidate: true })
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
    })
  }

  const onSubmit = (_data: KycOnboardingFormData) => {
    finalizeMutation.mutate()
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-tract-alabaster font-inter text-tract-obsidian">
      <OnboardingHeader currentStep={4} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-tract-graphite/10">
        <div className="h-full w-full bg-tract-green transition-all duration-1000" />
      </div>

      <main className="flex grow flex-col items-center px-4 pb-10 pt-[88px] md:px-0">
        <div className="mt-10 w-full max-w-[760px]">
          <section className="mb-10 text-center md:text-left">
            <h1 className="mb-2 font-playfair text-[36px] font-bold text-tract-obsidian">Verify Your Identity</h1>
            <p className="max-w-[600px] font-inter text-[16px] text-gray-500">
              TRACT requires government ID verification and a linked bank account before accessing the marketplace.
            </p>
          </section>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <article className="group rounded-xl border border-black/5 bg-white p-8 shadow-sm transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tract-green-light text-tract-green">
                      <IdCard className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider',
                        idDocumentReady
                          ? 'bg-tract-green-light text-tract-green'
                          : 'bg-amber-50 text-amber-600',
                      )}
                    >
                      {uploadIdMutation.isPending ? 'Uploading' : idDocumentReady ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="mb-1 font-playfair text-[20px] font-bold text-tract-obsidian">Upload Your ID</h3>
                  <p className="mb-6 font-inter text-[14px] text-gray-500">Passport or Driver&apos;s License</p>

                  <div className="grow">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="sr-only"
                      aria-label="Upload government ID document"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) queueIdUpload(f)
                      }}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="ID document drop zone. Press Enter to choose a file."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          fileInputRef.current?.click()
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const f = e.dataTransfer.files?.[0]
                        if (f) queueIdUpload(f)
                      }}
                      className={cn(
                        'flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-tract-green/30 bg-tract-green-light/30 p-8 transition-colors hover:bg-tract-green-light/50',
                        errors.idFile && 'border-tract-red bg-tract-red-light/30',
                      )}
                    >
                      {uploadIdMutation.isPending ? (
                        <Loader2 className="mb-2 h-8 w-8 animate-spin text-tract-green" aria-hidden />
                      ) : (
                        <Upload className="mb-2 h-8 w-8 text-tract-green" strokeWidth={1.5} aria-hidden />
                      )}
                      <p className="mb-1 font-inter text-[14px] font-semibold text-tract-green">
                        Drag &amp; drop or click to upload
                      </p>
                      <p className="text-center text-[12px] text-gray-500/70">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                  {errors.idFile ? (
                    <p role="alert" className="mt-2 font-inter text-[12px] text-tract-red">
                      {errors.idFile.message}
                    </p>
                  ) : null}
                </div>
              </article>

              <article className="rounded-xl border border-black/5 bg-white p-8 shadow-sm transition-transform duration-200 hover:scale-[1.02]">
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tract-green-light text-tract-green">
                      <Camera className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider',
                        faceVerified
                          ? 'bg-tract-green-light text-tract-green'
                          : 'bg-amber-50 text-amber-600',
                      )}
                    >
                      {faceMutation.isPending ? 'Starting' : faceVerified ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="mb-1 font-playfair text-[20px] font-bold text-tract-obsidian">Live Selfie</h3>
                  <p className="mb-6 font-inter text-[14px] text-gray-500">Match your face to your ID document</p>

                  <div className="flex grow flex-col justify-end">
                    <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-lg bg-tract-obsidian/5">
                      <img
                        src={SELFIE_PLACEHOLDER_SRC}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-10 grayscale"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <UserCircle className="h-16 w-16 text-gray-400/20" strokeWidth={1} aria-hidden />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={faceMutation.isPending || faceVerified}
                      aria-label="Start camera for live selfie verification"
                      onClick={() => faceMutation.mutate()}
                      className="flex h-12 w-full items-center justify-center rounded-lg bg-tract-green font-inter text-[12px] font-semibold uppercase tracking-widest text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                    >
                      {faceMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          Starting…
                        </>
                      ) : (
                        'Start Camera'
                      )}
                    </button>
                    {errors.faceVerified ? (
                      <p role="alert" className="mt-2 font-inter text-[12px] text-tract-red">
                        {errors.faceVerified.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            </div>

            <article className="mb-6 rounded-xl border border-black/5 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tract-gold/20 text-tract-gold">
                  <Building2 className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="grow text-center md:text-left">
                  <h3 className="mb-1 font-playfair text-[20px] font-bold text-tract-obsidian">Link Your Bank Account</h3>
                  <p className="font-inter text-[14px] text-gray-500">
                    Required for platform fee processing. Secured by Plaid.
                  </p>
                </div>
                <div className="w-full shrink-0 md:w-auto">
                  <button
                    type="button"
                    disabled={bankMutation.isPending || bankLinked}
                    aria-label="Connect your bank with Plaid"
                    onClick={() => bankMutation.mutate()}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-tract-gold px-4 font-inter text-[14px] font-semibold text-[#554300] transition-colors hover:bg-yellow-500 active:scale-[0.98] disabled:opacity-70 md:w-[240px]"
                  >
                    {bankMutation.isPending ? (
                      <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                    ) : (
                      <Lock className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                    )}
                    Connect Your Bank
                  </button>
                </div>
              </div>
              {errors.bankLinked ? (
                <p role="alert" className="mt-4 text-center font-inter text-[12px] text-tract-red md:text-left">
                  {errors.bankLinked.message}
                </p>
              ) : null}
            </article>

            <div className="mb-10 flex flex-wrap items-center justify-center gap-6 border-y border-tract-graphite/10 py-6 md:justify-start md:gap-8">
              <StatusItem done={idDocumentReady} label="ID Uploaded" />
              <span className="hidden h-1 w-1 rounded-full bg-tract-graphite/20 md:block" aria-hidden />
              <StatusItem done={faceVerified} label="Face Matched" />
              <span className="hidden h-1 w-1 rounded-full bg-tract-graphite/20 md:block" aria-hidden />
              <StatusItem done={bankLinked} label="Bank Linked" />
            </div>

            <button
              type="submit"
              disabled={finalizeMutation.isPending}
              aria-busy={finalizeMutation.isPending}
              className="flex h-14 w-full items-center justify-center rounded-lg bg-tract-gold font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-[#554300] shadow-sm transition-all hover:bg-yellow-500 hover:shadow-lg active:scale-[0.97] disabled:opacity-70"
            >
              {finalizeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                  Continuing…
                </>
              ) : (
                'Continue to Marketplace'
              )}
            </button>

            <p className="mt-4 mb-2 text-center font-inter text-[12px] text-gray-400">
              You can complete identity verification later in your account settings. Some features require
              full verification.
            </p>

            <button
              type="button"
              onClick={() => navigate('/register/bank')}
              className="mb-6 w-full text-center font-inter text-[14px] text-gray-400 underline underline-offset-4 transition-colors hover:text-tract-obsidian"
            >
              Skip for now — I'll verify later
            </button>
          </form>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
