import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { APP2_STATES } from '@/lib/constants/states'

export default function AdminStateFirewallPage() {
  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="min-h-screen">
        <div className="mx-auto max-w-[800px] p-6 md:p-10 space-y-6">
          <PageHeader eyebrow="Admin Workspace" title="State Firewall" />

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <h2 className="mb-2 font-cinzel text-[22px] font-bold text-app1-text-main">Supported States</h2>
            <p className="mb-6 font-poppins text-[14px] text-app1-text-muted">
              TRACT App 2 currently operates in these 7 states. Contact engineering to add or remove
              states.
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {APP2_STATES.map((s) => (
                <div
                  key={s.code}
                  className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-4 transition-all hover:-translate-y-1"
                >
                  <div>
                    <p className="font-poppins text-[14px] font-bold text-app1-text-main">{s.name}</p>
                    <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">{s.code}</p>
                  </div>
                  <span className="inline-block rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <h2 className="mb-2 font-cinzel text-[22px] font-bold text-app1-text-main">
              Restricted State Rules
            </h2>
            <p className="font-poppins text-[14px] text-app1-text-muted">
              All 7 states are currently open to all verified roles. State-level role restrictions
              (wholesaler firewall) are an App 1 feature and are not enforced in App 2.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
