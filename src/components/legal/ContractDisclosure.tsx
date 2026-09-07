import { useId } from 'react'

export function PlatformDisclosure() {
  return (
    <div className="space-y-2 font-poppins text-sm leading-relaxed text-app1-text-muted">
      <p>TRACT provides software infrastructure, not brokerage representation, title services, or escrow. Earnest money is paid directly to the title company; TRACT does not collect or hold EMD.</p>
      <p>Monthly platform access is $50 for wholesalers and $100 for buyers and realtors, payable before your first contract or assignment. These SaaS fees are non-refundable regardless of closing. The introductory beta lasts 60 days from launch and may include updates and interruptions.</p>
      <p>Keep deals discovered through TRACT in its digital workflows and report material updates and executed documents. Bypassing the platform violates the Terms of Service and may result in account termination and legal claims described there. Off-platform transactions can expose you to fraud and loss.</p>
      <p>Verification documents support identity checks, fraud prevention, and compliance. TRACT does not sell your private data. See the <a href="/legal/privacy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a> for data use and service-provider disclosures.</p>
    </div>
  )
}

export default function ContractDisclosure({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId()
  return (
    <section className="rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
      <h2 className="mb-3 font-poppins font-semibold text-app1-text-main">Before you execute a contract</h2>
      <PlatformDisclosure />
      <div className="mt-4 flex items-start gap-3">
        <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
        <label htmlFor={id} className="font-poppins text-sm text-app1-text-main">I acknowledge these disclosures and agree to the <a href="/legal/terms" target="_blank" rel="noreferrer" className="underline">Terms of Service &amp; Beta Participation Agreement</a> (version September 7, 2026).</label>
      </div>
    </section>
  )
}
