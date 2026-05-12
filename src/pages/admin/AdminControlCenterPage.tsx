import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'

const ADMIN_AVATAR = DEFAULT_AVATAR_IMAGE

const REVENUE_MONTH = 47_200

const BAR_WEEKS = [
  { label: 'W1', h: 40 },
  { label: 'W2', h: 65 },
  { label: 'W3', h: 85 },
  { label: 'W4', h: 55 },
] as const

export default function AdminControlCenterPage() {
  const user = useAuthStore((s) => s.user)

  const displayName = user?.fullName?.trim() || 'Administrator'

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
      <main className="min-h-screen overflow-x-hidden px-4 py-8 md:p-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-playfair text-[28px] font-bold text-tract-obsidian">Admin control center</h2>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-inter text-base font-bold text-tract-obsidian">{displayName}</p>
              <p className="font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500">Last login: 2h ago</p>
            </div>
            <img src={ADMIN_AVATAR} alt="" className="h-12 w-12 rounded-full border-2 border-tract-gold object-cover" />
          </div>
        </header>

        <div className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-5">
          {[
            { label: 'Pending review', value: '4', bg: 'bg-tract-red-light', border: 'border-tract-red/10', valueClass: 'text-tract-red' },
            { label: 'Active deals', value: '23', bg: 'bg-white', border: 'border-[#4d4635]/20', valueClass: 'text-tract-green' },
            { label: 'Flagged penalties', value: '2', bg: 'bg-tract-red-light', border: 'border-tract-red/10', valueClass: 'text-tract-red' },
            { label: 'Total users', value: '847', bg: 'bg-white', border: 'border-[#4d4635]/20', valueClass: 'text-tract-obsidian' },
            {
              label: 'Platform revenue',
              value: formatCurrency(REVENUE_MONTH),
              bg: 'bg-white',
              border: 'border-[#4d4635]/20',
              valueClass: 'text-tract-gold',
            },
          ].map((c) => (
            <div
              key={c.label}
              className={cn(
                'flex cursor-default flex-col justify-between rounded-2xl border p-6 transition-transform hover:scale-[1.02]',
                c.bg,
                c.border,
              )}
            >
              <p className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">{c.label}</p>
              <p className={cn('mt-2 font-playfair text-[40px] font-bold leading-none', c.valueClass)}>{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="border border-[#4d4635]/20 bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-widest text-gray-500">
                Pending compliance review
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Property', 'Wholesaler', 'Submitted', 'Flag', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'py-4 font-inter text-xs font-bold uppercase text-gray-500',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="transition-colors hover:bg-gray-50">
                      <td className="py-5 font-inter text-base font-bold text-tract-obsidian">4821 Maple Dr</td>
                      <td className="py-5 font-inter text-sm text-gray-500">Marcus T.</td>
                      <td className="py-5 font-inter text-sm text-gray-500">2h ago</td>
                      <td className="py-5">
                        <span className="rounded bg-gray-100 px-2 py-1 font-inter text-sm text-gray-500">None</span>
                      </td>
                      <td className="space-x-2 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => toast.success('Listing approved.')}
                          className="rounded bg-tract-green px-3 py-1 font-inter text-sm font-bold text-white hover:opacity-80"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.error('Listing rejected.')}
                          className="rounded bg-tract-red px-3 py-1 font-inter text-sm font-bold text-white hover:opacity-80"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                    <tr className="transition-colors hover:bg-gray-50">
                      <td className="py-5 font-inter text-base font-bold text-tract-obsidian">902 River Bend</td>
                      <td className="py-5 font-inter text-sm text-gray-500">Alex K.</td>
                      <td className="py-5 font-inter text-sm text-gray-500">5h ago</td>
                      <td className="py-5">
                        <span className="rounded border border-amber-700/20 bg-amber-50 px-2 py-1 font-inter text-sm font-bold text-amber-800">
                          Low ARV
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <button
                          type="button"
                          onClick={() => toast.message('Opening compliance review…')}
                          className="rounded border border-tract-gold px-4 py-1 font-inter text-sm font-bold text-tract-gold hover:bg-tract-gold/5"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="border border-[#4d4635]/20 bg-white p-8 shadow-sm">
              <h3 className="mb-6 flex items-center font-playfair text-xl font-bold text-tract-obsidian">
                <ShieldAlert className="mr-2 h-6 w-6 text-tract-red" strokeWidth={1.75} aria-hidden />
                Recent automated penalties
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Fee edit attempt',
                    who: 'Marcus Thompson',
                    detail: 'Auto-voided deal + 30-day ban • 3h ago',
                    border: 'border-tract-red',
                    bg: 'bg-tract-red-light/30 hover:bg-tract-red-light/50',
                    detailClass: 'text-tract-red italic',
                    btnClass: 'text-tract-red',
                  },
                  {
                    title: 'Buyer ghost',
                    who: 'Taylor Rodriguez',
                    detail: 'EMD flagged for forfeiture • 1d ago',
                    border: 'border-tract-red',
                    bg: 'bg-tract-red-light/30 hover:bg-tract-red-light/50',
                    detailClass: 'text-tract-red italic',
                    btnClass: 'text-tract-red',
                  },
                  {
                    title: 'Fake ARV suspected',
                    who: 'Review pending',
                    detail: 'Alex Kim • 6h ago',
                    border: 'border-amber-700',
                    bg: 'bg-amber-50/80 hover:bg-amber-50',
                    detailClass: 'text-amber-800 italic',
                    btnClass: 'text-amber-800',
                  },
                ].map((p) => (
                  <div
                    key={p.title}
                    className={cn(
                      'flex flex-col justify-between gap-3 border-l-4 p-4 transition-all sm:flex-row sm:items-center',
                      p.border,
                      p.bg,
                    )}
                  >
                    <div>
                      <p className="font-inter text-base font-bold text-tract-obsidian">
                        {p.title} — <span className="font-normal text-gray-500">{p.who}</span>
                      </p>
                      <p className={cn('mt-1 font-inter text-sm', p.detailClass)}>{p.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.message('Penalty review queue coming soon.')}
                      className={cn(
                        'shrink-0 font-inter text-xs font-bold uppercase tracking-wider hover:underline',
                        p.btnClass,
                      )}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="flex h-full min-h-[420px] flex-col border border-[#4d4635]/20 bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-widest text-gray-500">
                Revenue tracker
              </h3>
              <div className="mb-10">
                <p className="font-playfair text-[40px] font-bold leading-none text-tract-gold">
                  {formatCurrency(REVENUE_MONTH)}
                </p>
                <p className="mt-1 font-inter text-sm italic text-gray-500">Platform fees collected this month</p>
              </div>
              <div className="flex h-48 flex-1 items-end gap-3 pb-6">
                {BAR_WEEKS.map((w) => (
                  <div key={w.label} className="group relative h-full w-full bg-tract-gold/20">
                    <div
                      className="absolute bottom-0 w-full bg-tract-gold transition-opacity group-hover:opacity-80"
                      style={{ height: `${w.h}%` }}
                    />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-inter text-[10px] font-bold text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                      {w.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t border-gray-100 pt-8">
                <div className="mb-3 flex justify-between font-inter text-sm">
                  <span className="text-gray-500">Target progress</span>
                  <span className="font-bold text-tract-gold">92%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-tract-gold" style={{ width: '92%' }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.message('Full ledger export coming soon.')}
                className="mt-6 w-full border border-tract-graphite py-3 font-inter text-sm font-semibold text-tract-obsidian transition-colors hover:bg-gray-50"
              >
                View full ledger
              </button>
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
