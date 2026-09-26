import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'

const SELLER_URL = import.meta.env.VITE_SELLER_PORTAL_URL || 'https://seller.tractcorp.com'
const BUYER_URL = import.meta.env.VITE_BUYER_PORTAL_URL || 'https://buyer.tractcorp.com'

export default function PortalSwitch() {
  const role = useAuthStore((s) => s.user?.role)
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const active = host.includes('seller') ? 'seller' : 'buyer'
  const show = useMemo(() => ['wholesaler', 'realtor', 'buyer', 'seller'].includes(role ?? ''), [role])

  if (!show) return null

  return (
    <div className="flex items-center rounded-full border border-app1-border-light bg-white p-1 shadow-sm" aria-label="Switch portal">
      <a
        href={SELLER_URL}
        className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${active === 'seller' ? 'bg-app1-primary text-white' : 'text-app1-primary hover:bg-app1-bg-soft'}`}
      >
        Seller
      </a>
      <a
        href={BUYER_URL}
        className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${active === 'buyer' ? 'bg-app1-secondary text-app1-primary-dark' : 'text-app1-primary hover:bg-app1-bg-soft'}`}
      >
        Buyer
      </a>
    </div>
  )
}
