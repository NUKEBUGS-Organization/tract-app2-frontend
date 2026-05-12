import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CircleCheck, FileSignature, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'

const SELLER_AVATAR = DEFAULT_AVATAR_IMAGE

const BUYER_AVATAR = DEFAULT_AVATAR_IMAGE

const DEFAULT_ADDRESS = '4821 Maple Drive, Austin, TX'

const TERMS = [
  { label: 'Assignment price', value: formatCurrency(45_000) + '.00' },
  { label: 'Inspection period', value: '7 days' },
  { label: 'Due diligence', value: '10 business days' },
  { label: 'Assignment fee', value: formatCurrency(35_000) + '.00' },
  {
    label: 'Special terms',
    value: 'Cash offer, 10-day close. No contingencies.',
    wide: true,
  },
] as const

const ARTICLES = [
  {
    title: 'ARTICLE I: ASSIGNMENT OF CONTRACT',
    blur: 'blur-[1px]',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    title: 'ARTICLE II: CONSIDERATION',
    blur: 'blur-[1px]',
    body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  },
  {
    title: 'ARTICLE III: CLOSING AND POSSESSION',
    blur: 'blur-[1.5px]',
    body: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
  },
  {
    title: 'ARTICLE IV: REPRESENTATIONS AND WARRANTIES',
    blur: 'blur-[2px]',
    body: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  },
]

function contractRefFromDealId(dealId: string | undefined): string {
  if (!dealId) return 'C-2047'
  const slug = dealId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
  return slug ? `C-${slug}` : 'C-2047'
}

export default function ContractSigningPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const dealIdSafe = dealId ?? 'under-contract-demo'
  const user = useAuthStore((s) => s.user)

  const buyerDisplayName = user?.fullName?.trim() || 'Jordan Martinez'
  const contractRef = useMemo(() => contractRefFromDealId(dealId), [dealId])

  const executionDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)

  const onSubmit = () => {
    if (!agreed) {
      toast.error('Please confirm you have read and agree to the terms.')
      return
    }
    setSigned(true)
    toast.success('Contract signed successfully.')
  }

  return (
    <div className="min-h-screen bg-tract-alabaster font-inter text-tract-obsidian antialiased">
      <header className="fixed top-0 z-50 w-full border-b border-[#323538] bg-tract-obsidian">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-playfair text-2xl font-bold text-[#95BF78]">
            TRACT
          </Link>
          <p className="font-inter text-base text-gray-400">Contract #{contractRef}</p>
        </div>
      </header>

      <div className="mt-[72px] w-full border-b border-tract-green/20 bg-tract-green-light py-2">
        <div className="mx-auto max-w-[800px] text-center">
          <span className="font-inter text-xs font-bold uppercase tracking-wider text-tract-green">
            Step 1 of 8 — Contract activation
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[800px] px-4 py-10 md:px-0">
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-md md:p-10">
          <div className="mb-6">
            <h1 className="mb-1 font-playfair text-3xl font-bold text-tract-obsidian">
              Purchase &amp; assignment agreement
            </h1>
            <p className="font-inter text-base text-gray-500">{DEFAULT_ADDRESS}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 rounded-lg bg-gray-50 p-6 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <img
                src={SELLER_AVATAR}
                alt=""
                className="h-12 w-12 rounded-full border border-tract-green/20 object-cover"
              />
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Seller/wholesaler</p>
                <p className="font-inter text-base font-bold text-tract-obsidian">Julian Vance</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-tract-green-light px-2 py-0.5 font-inter text-[10px] font-bold text-tract-green">
                    Wholesaler
                  </span>
                  <span className="flex items-center font-inter text-[10px] font-bold text-tract-green">
                    Verified
                    <CircleCheck className="ml-0.5 h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={BUYER_AVATAR}
                alt=""
                className="h-12 w-12 rounded-full border border-tract-green/20 object-cover"
              />
              <div>
                <p className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Buyer</p>
                <p className="font-inter text-base font-bold text-tract-obsidian">{buyerDisplayName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-tract-green-light px-2 py-0.5 font-inter text-[10px] font-bold text-tract-green">
                    End buyer
                  </span>
                  <span className="flex items-center font-inter text-[10px] font-bold text-tract-green">
                    Verified
                    <CircleCheck className="ml-0.5 h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="mb-4 font-inter text-xs font-bold uppercase tracking-wider text-gray-500">
              Key agreement terms
            </h3>
            <div className="space-y-0">
              {TERMS.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 border-b border-gray-50 py-2 sm:flex-row sm:items-start sm:justify-between"
                >
                  <span className="font-inter text-sm text-gray-500">{row.label}</span>
                  <span
                    className={cn(
                      'font-inter text-sm font-semibold tracking-wide text-tract-obsidian',
                      'wide' in row && row.wide ? 'text-right sm:max-w-[60%]' : '',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-6">
            <div className="contract-doc-scroll h-[300px] overflow-y-auto rounded-lg bg-gray-50 p-6">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500">
                {ARTICLES.map((a) => (
                  <div key={a.title}>
                    <p className="mb-2 font-bold text-tract-obsidian">{a.title}</p>
                    <p className={cn('mb-4', a.blur)}>{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-24 items-end justify-center rounded-b-lg bg-gradient-to-t from-gray-50 from-20% to-transparent pb-4"
              aria-hidden
            >
              <span className="rounded-full bg-white/80 px-3 py-1 text-center text-xs font-semibold text-gray-500 shadow-sm backdrop-blur-sm">
                Scroll to read full document
              </span>
            </div>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-start gap-3">
              <input
                id="tract-contract-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-tract-gold focus:ring-tract-gold"
              />
              <label htmlFor="tract-contract-agree" className="font-inter text-sm text-tract-obsidian">
                I, <span className="font-bold">{buyerDisplayName}</span>, have read and agree to all terms above,
                including the TRACT master services agreement and assignment protocols.
              </label>
            </div>

            <div className="relative rounded-lg border-2 border-dashed border-tract-gold/30 bg-white p-6">
              <p className="mb-6 text-center font-inter text-sm italic text-gray-400">
                Click to sign with your TRACT verified signature
              </p>
              <div className="flex flex-col items-end justify-between gap-4 md:flex-row">
                <div className="mb-4 w-full text-center md:mb-0 md:text-left">
                  <span className="font-dancing text-4xl text-tract-obsidian">{buyerDisplayName}</span>
                  <div className="mt-1 h-px w-full bg-tract-obsidian/20" />
                  <p className="mt-1 font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Buyer electronic signature
                  </p>
                </div>
                <div className="w-full text-center md:w-auto md:text-right">
                  <span className="font-inter text-sm font-semibold tracking-wide text-tract-obsidian">
                    {executionDate}
                  </span>
                  <p className="mt-1 font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Date of execution
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={signed}
              className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-lg bg-tract-gold font-inter text-sm font-bold uppercase tracking-[0.1em] text-tract-obsidian transition-colors hover:bg-[#C29D2C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signed ? 'Contract signed' : 'Accept & sign contract'}
              <FileSignature className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="font-inter text-sm text-gray-500 underline transition-colors hover:text-tract-obsidian"
                onClick={() => toast.message('PDF download will be available when document generation is wired.')}
              >
                Download PDF copy
              </button>
            </div>
          </div>

          <div
            className={cn(
              'mt-10 border-t border-gray-100 pt-6 transition-opacity',
              signed ? 'opacity-100' : 'opacity-50',
            )}
          >
            <p className="mb-2 text-center font-inter text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Post-execution status preview
            </p>
            <div className="flex justify-center">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full border border-tract-green/10 px-6 py-2 font-inter text-sm font-bold text-tract-green',
                  signed ? 'bg-tract-green-light' : 'bg-gray-100 text-gray-400',
                )}
              >
                <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                Contract signed ✓
              </div>
            </div>
          </div>

          {signed ? (
            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <Link
                to={`/deals/${dealIdSafe}/title`}
                className="font-inter text-sm font-semibold text-tract-gold underline decoration-tract-gold/50 underline-offset-4 transition-colors hover:text-[#C29D2C]"
              >
                Continue to title company selection
              </Link>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="mt-10 border-t border-[#323538] bg-[#0B0E11]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-12">
          <div className="font-playfair text-xl font-bold text-tract-gold">TRACT</div>
          <nav className="flex flex-wrap justify-center gap-6">
            {['Privacy policy', 'Terms of service', 'Legal notices', 'Regulatory disclosure'].map((label) => (
              <button
                key={label}
                type="button"
                className="font-inter text-sm text-[#d0c5af] transition-colors hover:text-white"
                onClick={() => toast.message('Link coming soon.')}
              >
                {label}
              </button>
            ))}
          </nav>
          <p className="text-center font-inter text-sm text-[#d0c5af]">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
