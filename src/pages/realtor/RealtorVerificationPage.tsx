import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Hash,
  Info,
  Loader2,
  MapPin,
  User,
  XCircle,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useAuthStore } from '@/store/authStore'
import {
  useMyRealtorVerification,
  useSubmitRealtorVerification,
} from '@/hooks/useRealtorVerification'
import { cn } from '@/lib/utils'

type FormState = {
  state_license_number: string
  brokerage_name: string
  managing_broker: string
  office_address: string
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string
  icon: typeof Hash
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app1-text-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-app1-border-light bg-app1-bg-soft py-3.5 pl-10 pr-4 font-poppins text-sm font-medium text-app1-text-main outline-none transition focus:border-app1-primary focus:ring-2 focus:ring-app1-primary/10"
        />
      </div>
    </div>
  )
}

export default function RealtorVerificationPage() {
  const user = useAuthStore((s) => s.user)
  const { data: statusData, isLoading, refetch } = useMyRealtorVerification(user?.role === 'realtor')
  const submitMutation = useSubmitRealtorVerification()

  const [error, setError] = useState<string | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [form, setForm] = useState<FormState>({
    state_license_number: '',
    brokerage_name: '',
    managing_broker: '',
    office_address: '',
  })

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const status = statusData?.status ?? 'not_submitted'
  const rejectionReason = statusData?.rejectionReason
  const isApproved = status === 'approved'
  const isPending = status === 'pending' || justSubmitted
  const isRejected = status === 'rejected' && !justSubmitted

  async function handleSubmit() {
    setError(null)
    if (!form.state_license_number.trim()) {
      setError('Please enter your State License Number.')
      return
    }
    if (!form.brokerage_name.trim()) {
      setError('Please enter your Brokerage Name.')
      return
    }
    if (!form.managing_broker.trim()) {
      setError("Please enter your Managing Broker's name.")
      return
    }
    if (!form.office_address.trim()) {
      setError('Please enter your Office Address.')
      return
    }

    try {
      await submitMutation.mutateAsync({
        state_license_number: form.state_license_number.trim(),
        brokerage_name: form.brokerage_name.trim(),
        managing_broker: form.managing_broker.trim(),
        office_address: form.office_address.trim(),
      })
      setJustSubmitted(true)
      setForm({
        state_license_number: '',
        brokerage_name: '',
        managing_broker: '',
        office_address: '',
      })
      await refetch()
    } catch {
      /* toast handled in hook */
    }
  }

  if (user?.role !== 'realtor') {
    return (
      <DashboardLayout sidebar={<WholesalerSidebar />}>
        <main className="flex min-h-screen items-center justify-center p-8">
          <p className="font-poppins text-sm text-app1-text-muted">
            Professional verification is only available for realtor accounts.
          </p>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[960px] space-y-8 p-6 md:p-10">
          <section className="relative overflow-hidden rounded-2xl bg-app1-primary p-8 shadow-app1-card">
            <div className="relative max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-app1-secondary/30 bg-app1-secondary/10 px-3 py-1">
                <BadgeCheck className="h-3.5 w-3.5 text-app1-secondary" />
                <span className="font-poppins text-[10px] font-black uppercase tracking-[0.25em] text-app1-secondary">
                  Licensed Partner Verification
                </span>
              </div>
              <h1 className="font-cinzel text-3xl font-black text-white lg:text-4xl">
                Professional Verification
              </h1>
              <p className="mt-2 max-w-xl font-poppins text-sm leading-6 text-white/60">
                Submit your State License Number and Brokerage details for admin review. Full
                marketplace access unlocks once your credentials are verified.
              </p>
            </div>
          </section>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-app1-secondary" />
            </div>
          ) : null}

          {isApproved ? (
            <div className="flex items-center gap-4 rounded-2xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-app1-primary/10 text-app1-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-poppins text-sm font-bold text-app1-primary">
                  Credentials verified — Full platform access
                </p>
                <p className="mt-0.5 font-poppins text-xs text-app1-text-muted">
                  You&apos;re all set. Your realtor credentials have been approved.
                </p>
              </div>
              <Link
                to="/buyer/marketplace"
                className="inline-flex items-center gap-2 border border-app1-secondary/30 bg-app1-secondary/10 px-5 py-3 font-poppins text-[10px] font-black uppercase tracking-[0.2em] text-app1-secondary hover:bg-app1-secondary/20"
              >
                Browse Properties
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}

          {isPending && !isApproved ? (
            <div className="flex items-start gap-4 rounded-2xl border border-amber-300/40 bg-amber-50 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="font-poppins text-sm font-bold text-amber-800">Pending admin approval</p>
                <p className="mt-1 font-poppins text-xs leading-6 text-app1-text-muted">
                  Your credentials are under review. This typically takes 1–2 business days.
                </p>
              </div>
            </div>
          ) : null}

          {isRejected ? (
            <div className="flex items-start gap-4 rounded-2xl border border-app1-danger/30 bg-app1-danger/5 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-app1-danger/10 text-app1-danger">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-poppins text-sm font-bold text-app1-danger">
                  Submission rejected — please resubmit
                </p>
                <p className="mt-1 font-poppins text-xs leading-6 text-app1-text-muted">
                  {rejectionReason ||
                    "Your submission didn't meet our requirements. Please correct your information and resubmit."}
                </p>
              </div>
            </div>
          ) : null}

          {!isApproved && !isPending && !isLoading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card lg:col-span-2">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-app1-secondary/30 bg-app1-secondary/10">
                    <Building2 className="h-5 w-5 text-app1-secondary" />
                  </div>
                  <div>
                    <h2 className="font-cinzel text-xl font-black text-app1-primary">
                      {isRejected ? 'Resubmit Credentials' : 'License & Brokerage'}
                    </h2>
                    <p className="font-poppins text-xs text-app1-text-muted">
                      All fields are required for admin review
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <InputField
                    label="State License Number"
                    icon={Hash}
                    value={form.state_license_number}
                    onChange={(v) => set('state_license_number', v)}
                    placeholder="e.g. RE-123456"
                  />
                  <InputField
                    label="Brokerage Name"
                    icon={Building2}
                    value={form.brokerage_name}
                    onChange={(v) => set('brokerage_name', v)}
                    placeholder="e.g. Skyline Realty Group"
                  />
                  <InputField
                    label="Managing Broker"
                    icon={User}
                    value={form.managing_broker}
                    onChange={(v) => set('managing_broker', v)}
                    placeholder="Full name of managing broker"
                  />
                  <InputField
                    label="Office Address"
                    icon={MapPin}
                    value={form.office_address}
                    onChange={(v) => set('office_address', v)}
                    placeholder="Street, city, state, ZIP"
                  />
                </div>

                {error ? (
                  <p className="mt-4 font-poppins text-sm text-app1-danger">{error}</p>
                ) : null}

                <button
                  type="button"
                  disabled={submitMutation.isPending}
                  onClick={() => void handleSubmit()}
                  className={cn(
                    'mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-app1-secondary py-3.5',
                    'font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary-dark',
                    'hover:brightness-110 disabled:opacity-50',
                  )}
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BadgeCheck className="h-4 w-4" />
                  )}
                  {submitMutation.isPending ? 'Submitting…' : 'Submit Credentials'}
                </button>
              </section>

              <aside className="rounded-2xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                <div className="mb-3 flex items-center gap-2 text-app1-primary">
                  <Info className="h-4 w-4" />
                  <p className="font-poppins text-[11px] font-black uppercase tracking-[0.16em]">
                    What happens next
                  </p>
                </div>
                <ul className="space-y-3 font-poppins text-xs leading-5 text-app1-text-muted">
                  <li>Admin verifies your license with the state board.</li>
                  <li>Identity KYC is not required until Jumio is enabled.</li>
                  <li>You can resubmit if your application is rejected.</li>
                </ul>
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
