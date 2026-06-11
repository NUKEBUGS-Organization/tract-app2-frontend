import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import TopBar from '@/components/layout/TopBar'
import { APP2_STATES } from '@/lib/constants/states'

export default function AdminStateFirewallPage() {
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="State Firewall" />
        <div className="mx-auto max-w-[800px] p-6 md:p-10">
          <div className="mb-6 rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <h2 className="mb-2 font-playfair text-[22px] font-bold text-theme-text">Supported States</h2>
            <p className="mb-6 font-inter text-[14px] text-theme-muted">
              TRACT App 2 currently operates in these 7 states. Contact engineering to add or remove
              states.
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {APP2_STATES.map((s) => (
                <div
                  key={s.code}
                  className="flex items-center justify-between rounded-[10px] border border-theme-border bg-theme-surface-2 p-4"
                >
                  <div>
                    <p className="font-inter text-[14px] font-bold text-theme-text">{s.name}</p>
                    <p className="mt-0.5 font-inter text-[12px] text-theme-muted">{s.code}</p>
                  </div>
                  <span className="inline-block rounded-full bg-tract-green-light px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <h2 className="mb-2 font-playfair text-[22px] font-bold text-theme-text">
              Restricted State Rules
            </h2>
            <p className="font-inter text-[14px] text-theme-muted">
              All 7 states are currently open to all verified roles. State-level role restrictions
              (wholesaler firewall) are an App 1 feature and are not enforced in App 2.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
