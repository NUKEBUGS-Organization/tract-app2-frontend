import { Building2, Handshake, ShieldCheck } from 'lucide-react'
import StatCard from '@/components/app1/StatCard'
import HeroBanner from '@/components/app1/HeroBanner'
import PageHeader from '@/components/app1/PageHeader'
import TrackerStep from '@/components/app1/TrackerStep'
import StatusPill from '@/components/app1/StatusPill'
import { useUiStore } from '@/store/uiStore'

export default function App1ComponentTest() {
  const proMode = useUiStore((s) => s.proMode)
  const toggleProMode = useUiStore((s) => s.toggleProMode)

  return (
    <div className="min-h-screen space-y-8 bg-app1-bg-main p-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleProMode}
          className="rounded-app1-button border border-app1-border-light bg-app1-bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-app1-primary"
        >
          {proMode ? 'Dark (proMode)' : 'Light (proMode)'}
        </button>
      </div>

      <HeroBanner
        eyebrow="Test Workspace"
        title="Component Preview"
        description="Visual check for all 5 ported App 1 components."
      />
      <PageHeader eyebrow="Preview" title="Page Header Test" description="Testing the header pattern." />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Deals" value={24} note="All time" icon={Handshake} path="/" />
        <StatCard label="Pending" value={3} note="Needs review" icon={ShieldCheck} tone="warning" />
        <StatCard label="Listings" value={12} note="Live now" icon={Building2} tone="neutral" featured />
      </div>
      <div className="space-y-3">
        <TrackerStep title="Step One" description="Completed step example." done />
        <TrackerStep title="Step Two" description="Currently active step." current />
        <TrackerStep title="Step Three" description="Not started yet." />
      </div>
      <div className="flex gap-3">
        <StatusPill status="active" />
        <StatusPill status="pending" />
        <StatusPill status="cancelled" />
      </div>
    </div>
  )
}
