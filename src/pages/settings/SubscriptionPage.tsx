import { Link } from 'react-router-dom'
import { SubscriptionPanel } from '@/components/payments/SubscriptionGate'
import SubscriptionPreview from '@/components/payments/SubscriptionPreview'
export default function SubscriptionPage() {
  const preview = import.meta.env.DEV && (window.location.pathname === '/preview/subscription' || new URLSearchParams(window.location.search).get('preview') === 'true')
  return <main className="min-h-screen bg-app1-bg-main p-6 md:p-12"><div className="mx-auto max-w-2xl space-y-6"><Link to="/" className="text-app1-text-main underline">Back to workspace</Link>{import.meta.env.DEV && <Link to={preview ? '/settings/subscription' : '/settings/subscription?preview=true'} className="block underline text-app1-text-main">{preview ? 'Connected subscription' : 'Open subscription test UI'}</Link>}{preview ? <SubscriptionPreview /> : <SubscriptionPanel />}</div></main>
}
