import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Building2, Info, Landmark, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { isListerRole } from '@/lib/roleHome'

type TitleCompanyRow = {
  id: string
  name: string
  contactEmail: string
  phone: string
  active: boolean
}

export default function TitleCompanySelectionPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const userRole = useAuthStore((s) => s.user?.role)

  const [tab, setTab] = useState<'tract' | 'own'>('tract')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [ownName, setOwnName] = useState('')
  const [ownEmail, setOwnEmail] = useState('')
  const [ownWiring, setOwnWiring] = useState('')

  const {
    data: companies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['title-companies', 'active'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TitleCompanyRow[]>>('/title-companies')
      return data.data ?? []
    },
  })

  const effectiveSelectedId = useMemo(() => {
    if (selectedId && companies.some((c) => c.id === selectedId)) return selectedId
    return companies[0]?.id ?? null
  }, [companies, selectedId])

  const assignTitle = useMutation({
    mutationFn: async (payload: {
      titleCompanyName: string
      titleCompanyEmail: string
      emdWiringInstructions?: string
    }) => {
      const { data } = await api.post(`/deals/${dealId}/title-company`, payload)
      return data.data
    },
    onSuccess: (_, vars) => {
      toast.success(`Contract routed to ${vars.titleCompanyName}.`)
      navigate(`/deals/${dealId}`)
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to assign title company.'
      toast.error(message)
    },
  })

  const handleConfirm = () => {
    if (tab === 'tract') {
      const c = companies.find((x) => x.id === effectiveSelectedId)
      if (!c) {
        toast.error('No title company selected.')
        return
      }
      assignTitle.mutate({
        titleCompanyName: c.name,
        titleCompanyEmail: c.contactEmail,
      })
      return
    }

    if (!ownName.trim()) {
      toast.error('Enter your title company name.')
      return
    }
    if (!ownEmail.trim()) {
      toast.error('Enter your title company email.')
      return
    }

    assignTitle.mutate({
      titleCompanyName: ownName.trim(),
      titleCompanyEmail: ownEmail.trim(),
      emdWiringInstructions: ownWiring.trim() || undefined,
    })
  }

  if (!dealId) return null

  return (
    <DashboardLayout sidebar={isListerRole(userRole) ? <WholesalerSidebar /> : <Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <TopBar title="Select Title Company" />

        <div className="mx-auto max-w-[760px] p-6 md:p-10">
          <div className="mb-8">
            <h1 className="mb-2 font-cinzel text-[32px] font-bold text-app1-text-main">Assign your title company</h1>
            <p className="font-poppins text-[15px] leading-relaxed text-app1-text-muted">
              The signed contract will be routed to your selected title company. EMD wiring instructions will be sent
              immediately after.
            </p>
          </div>

          <div className="mb-8 flex gap-6 border-b border-app1-border-light">
            {[
              { id: 'tract', label: "TRACT's list" },
              { id: 'own', label: 'Use my own' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as 'tract' | 'own')}
                className={cn(
                  'border-b-2 pb-4 font-poppins text-[12px] font-bold uppercase tracking-wider transition-colors',
                  tab === t.id
                    ? 'border-app1-secondary text-app1-secondary'
                    : 'border-transparent text-app1-text-muted hover:text-app1-text-main',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'tract' && (
            <div className="mb-8 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-app1-text-muted">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  <span className="font-poppins text-sm">Loading title companies…</span>
                </div>
              ) : isError ? (
                <p className="py-8 text-center font-poppins text-sm text-app1-danger">
                  Could not load title companies. Try again shortly.
                </p>
              ) : companies.length === 0 ? (
                <p className="py-8 text-center font-poppins text-sm text-app1-text-muted">
                  No TRACT-vetted title companies are available yet. Use your own, or contact support.
                </p>
              ) : (
                companies.map((c, index) => {
                  const selected = effectiveSelectedId === c.id
                  const Icon = index % 2 === 0 ? Landmark : Building2
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-[12px] p-5 text-left transition-all duration-200 hover:scale-[1.01]',
                        selected
                          ? 'border-2 border-app1-secondary bg-app1-secondary/5'
                          : 'border border-app1-border-light bg-app1-bg-card hover:border-app1-secondary/50',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border',
                          selected
                            ? 'border-app1-secondary bg-app1-secondary/10'
                            : 'border-app1-border-light bg-app1-bg-soft',
                        )}
                      >
                        <Icon
                          className={cn('h-7 w-7', selected ? 'text-app1-secondary' : 'text-app1-text-muted')}
                          strokeWidth={1.75}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-poppins text-[15px] font-bold text-app1-text-main">{c.name}</h3>
                          <span className="inline-flex items-center gap-1 rounded bg-app1-primary/10 px-2 py-0.5 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                            <BadgeCheck className="h-3 w-3" strokeWidth={2.5} />
                            TRACT vetted
                          </span>
                        </div>
                        <p className="font-poppins text-[13px] text-app1-text-muted">{c.contactEmail}</p>
                        {c.phone ? (
                          <p className="mt-1 font-poppins text-[12px] text-app1-text-muted">{c.phone}</p>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                          selected ? 'border-app1-secondary' : 'border-app1-border-light',
                        )}
                      >
                        {selected && <div className="h-2.5 w-2.5 rounded-full bg-app1-secondary" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          )}

          {tab === 'own' && (
            <div className="mb-8 space-y-4 rounded-[12px] border border-app1-border-light bg-app1-bg-card p-6">
              <div>
                <label
                  htmlFor="own-title"
                  className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted"
                >
                  Title Company Name *
                </label>
                <input
                  id="own-title"
                  type="text"
                  value={ownName}
                  onChange={(e) => setOwnName(e.target.value)}
                  placeholder="e.g. Chicago Title"
                  className="w-full rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="own-email"
                  className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted"
                >
                  Title Company Email *
                </label>
                <input
                  id="own-email"
                  type="email"
                  value={ownEmail}
                  onChange={(e) => setOwnEmail(e.target.value)}
                  placeholder="closings@yourtitle.com"
                  className="w-full rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="own-wiring"
                  className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted"
                >
                  EMD Wiring Instructions (optional)
                </label>
                <textarea
                  id="own-wiring"
                  value={ownWiring}
                  onChange={(e) => setOwnWiring(e.target.value)}
                  rows={3}
                  placeholder="Bank name, routing number, account number..."
                  className="w-full resize-none rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary/40"
                />
              </div>

              <p className="font-poppins text-[12px] text-app1-text-muted">
                TRACT will coordinate with your title company. Real-time tracker integration may be limited.
              </p>
            </div>
          )}

          <div className="mb-8 flex gap-3 rounded-[10px] border border-app1-secondary/30 bg-app1-secondary/5 p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-app1-secondary" strokeWidth={2} />
            <p className="font-poppins text-[13px] text-app1-text-muted">
              Selecting a TRACT-vetted title company ensures real-time status tracking and direct API integration for
              secure document handling.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={assignTitle.isPending || (tab === 'tract' && !effectiveSelectedId)}
            className="w-full rounded-xl bg-app1-secondary py-4 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {assignTitle.isPending ? 'Routing...' : 'Confirm & Route Contract'}
          </button>

          <p className="mt-4 text-center font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted">
            Secure AES-256 encrypted routing
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
