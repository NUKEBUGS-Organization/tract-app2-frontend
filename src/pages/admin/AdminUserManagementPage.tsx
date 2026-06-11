import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import TopBar from '@/components/layout/TopBar'
import { useVerificationQueue, useBanUser } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

const ROLE_STYLE: Record<string, string> = {
  wholesaler: 'bg-tract-gold/10 text-tract-gold',
  realtor: 'bg-blue-50 text-blue-600',
  buyer: 'bg-tract-green-light text-tract-green',
  title_rep: 'bg-purple-50 text-purple-600',
  admin: 'bg-tract-red-light text-tract-red',
}

export default function AdminUserManagementPage() {
  const { data: users = [], isLoading } = useVerificationQueue()
  const banUser = useBanUser()
  const [search, setSearch] = useState('')

  const filtered = users.filter(
    (u) =>
      !search.trim() ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="User Management" />
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">
          <div className="mb-6">
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md rounded-[8px] border border-theme-border bg-theme-input px-4 py-2.5 font-inter text-[14px] text-theme-text placeholder:text-theme-muted focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold"
            />
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {!isLoading && (
            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-surface-2">
                    {['User', 'Role', 'KYC Status', 'State', 'Action'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted',
                          h === 'Action' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center font-inter text-theme-muted">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-theme-surface-2">
                        <td className="px-6 py-4">
                          <p className="font-inter text-[14px] font-bold text-theme-text">
                            {user.fullName}
                          </p>
                          <p className="mt-0.5 font-inter text-[12px] text-theme-muted">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider',
                              ROLE_STYLE[user.role] ?? 'bg-theme-surface-2 text-theme-muted',
                            )}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider',
                              user.kycStatus === 'approved'
                                ? 'bg-tract-green-light text-tract-green'
                                : 'bg-amber-50 text-amber-700',
                            )}
                          >
                            {user.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">
                          {user.stateCode || '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={banUser.isPending}
                            onClick={() => {
                              if (window.confirm(`Ban ${user.fullName}?`)) {
                                banUser.mutate({
                                  userId: user.id,
                                  reason: 'Admin action',
                                  permanent: false,
                                  durationDays: 7,
                                })
                              }
                            }}
                            className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-red hover:underline disabled:opacity-50"
                          >
                            Ban
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
