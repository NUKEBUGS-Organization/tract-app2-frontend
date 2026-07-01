import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { useVerificationQueue, useBanUser } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

const ROLE_STYLE: Record<string, string> = {
  wholesaler: 'bg-app1-secondary/10 text-app1-secondary',
  realtor: 'bg-blue-50 text-blue-600',
  buyer: 'bg-app1-primary/10 text-app1-primary',
  title_rep: 'bg-purple-50 text-purple-600',
  admin: 'bg-app1-danger/10 text-app1-danger',
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
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="min-h-screen">
        <div className="mx-auto max-w-[1440px] p-6 md:p-10 space-y-6">
          <PageHeader eyebrow="Admin Workspace" title="User Management" />

          <div>
            <input
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md rounded-xl border border-app1-border-light bg-app1-bg-soft px-4 py-2.5 font-poppins text-[14px] text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-1 focus:ring-app1-secondary"
            />
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {!isLoading && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['User', 'Role', 'KYC Status', 'State', 'Action'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted',
                          h === 'Action' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app1-border-light">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center font-poppins text-app1-text-muted">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-app1-bg-soft">
                        <td className="px-6 py-4">
                          <p className="font-poppins text-[14px] font-bold text-app1-text-main">
                            {user.fullName}
                          </p>
                          <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                              ROLE_STYLE[user.role] ?? 'bg-app1-bg-soft text-app1-text-muted',
                            )}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                              user.kycStatus === 'approved'
                                ? 'bg-app1-primary/10 text-app1-primary'
                                : 'bg-amber-50 text-amber-700',
                            )}
                          >
                            {user.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
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
                            className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-danger hover:underline disabled:opacity-50"
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
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
