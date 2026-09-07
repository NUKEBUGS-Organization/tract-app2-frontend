import { useAdminDeals, type AdminDeal } from '@/hooks/useAdminDeals'
import { Link } from 'react-router-dom'
import { useTitlePackage } from '@/hooks/useDeal'
import { formatCurrency } from '@/lib/utils'


function TitleReferral({ deal }: { deal: AdminDeal }) {
  const id = String(deal.id ?? deal._id ?? '')
  const download = useTitlePackage(id)
  const listing = deal.listingId
  return (
    <article className="rounded-xl border border-app1-border-light p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="font-semibold">{listing?.propertyAddress ?? 'Property'}</h3>
          <p className="text-sm text-app1-text-muted">{[listing?.city, listing?.stateCode, listing?.zipCode].filter(Boolean).join(', ')}</p>
          <p className="mt-2 text-sm">Buyer: {deal.primaryBuyerId?.fullName ?? '—'} · Listing owner: {deal.wholesalerId?.fullName ?? '—'}</p>
        </div>
        <span className="text-sm font-semibold">{deal.titleHandling === 'tract' ? 'Admin handles title' : 'Buyer’s own title rep'}</span>
      </div>
      <p className="mt-2 text-sm text-app1-text-muted">Stage: {deal.currentStep?.replaceAll('_', ' ')}{deal.titleHandling === 'tract' && deal.currentStep !== 'funded_closed' ? ' · Awaiting admin advancement' : ''}</p>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {listing?.photoUrls?.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Property photo ${index + 1}`} className="h-20 w-28 shrink-0 rounded-lg object-cover" loading="lazy" />)}
      </div>
      <dl className="mt-4 flex flex-wrap gap-5 text-sm">
        {([['Purchase', listing?.purchasePrice], ['Minimum sale', listing?.assignmentFeeLow], ['Market', listing?.assignmentFeeHigh], ['ARV', listing?.arv], ['Assignment', deal.contractId?.assignmentFeeFinal]] as const).map(([label, value]) => value != null && <div key={label}><dt className="text-app1-text-muted">{label}</dt><dd className="font-semibold">{formatCurrency(value)}</dd></div>)}
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold">
        <Link to={`/deals/${id}`} className="text-app1-primary underline">Open deal / advance step</Link>
        {deal.contractId?.signedPdfUrl && <a href={deal.contractId.signedPdfUrl} target="_blank" rel="noreferrer" className="text-app1-primary underline">Signed contract</a>}
        <button type="button" onClick={() => download.mutate()} disabled={download.isPending} className="rounded-lg bg-app1-secondary px-4 py-2 disabled:opacity-50">{download.isPending ? 'Preparing package…' : 'Download deal ZIP'}</button>
      </div>
    </article>
  )
}

export default function AdminTitleQueue() {
  const { data = [], isLoading, isError, refetch } = useAdminDeals()
  const referrals = data.filter((deal) => deal.titleHandling && ['title_search_complete', 'clear_to_close', 'funded_closed'].includes(deal.currentStep ?? ''))
  return (
    <section className="space-y-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
      <h2 className="font-cinzel text-xl font-bold">Title search referrals</h2>
      <p className="text-sm text-app1-text-muted">Deals appear here when the buyer advances to title search, for either title-representative choice.</p>
      {isLoading ? <p>Loading referrals…</p> : isError ? <button type="button" onClick={() => void refetch()}>Could not load referrals. Retry</button> : referrals.length ? referrals.map((deal) => <TitleReferral key={deal.id ?? deal._id} deal={deal} />) : <p className="text-sm text-app1-text-muted">No title referrals yet.</p>}
    </section>
  )
}
