import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  Hotel,
  FileEdit,
  FileText,
  HelpCircle,
  Home,
  Info,
  Landmark,
  RefreshCw,
  Star,
  StarHalf,
  User,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'

const HEADER_AVATAR = DEFAULT_AVATAR_IMAGE

type TitleCompany = {
  id: string
  name: string
  location: string
  ratingLabel: string
  reviews: number
  stars: 'five' | 'fourHalf' | 'fourOne'
  Icon: typeof Landmark
}

const TITLE_COMPANIES: TitleCompany[] = [
  {
    id: 'first-american',
    name: 'First American Title',
    location: 'Austin, TX',
    ratingLabel: '4.9',
    reviews: 124,
    stars: 'five',
    Icon: Landmark,
  },
  {
    id: 'stewart',
    name: 'Stewart Title',
    location: 'Dallas, TX',
    ratingLabel: '4.8',
    reviews: 98,
    stars: 'fourHalf',
    Icon: Building2,
  },
  {
    id: 'old-republic',
    name: 'Old Republic Title',
    location: 'Houston, TX',
    ratingLabel: '4.7',
    reviews: 215,
    stars: 'fourOne',
    Icon: Hotel,
  },
]

function StarRow({ pattern }: { pattern: TitleCompany['stars'] }) {
  const filled = 'h-4 w-4 fill-tract-gold text-tract-gold'
  const empty = 'h-4 w-4 text-tract-gold/35'
  return (
    <div className="flex items-center gap-0.5">
      {pattern === 'five' ? (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={filled} strokeWidth={0} aria-hidden />
          ))}
        </>
      ) : null}
      {pattern === 'fourHalf' ? (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <Star key={i} className={filled} strokeWidth={0} aria-hidden />
          ))}
          <StarHalf className="h-4 w-4 fill-tract-gold text-tract-gold" strokeWidth={2} aria-hidden />
        </>
      ) : null}
      {pattern === 'fourOne' ? (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <Star key={i} className={filled} strokeWidth={0} aria-hidden />
          ))}
          <Star className={empty} strokeWidth={2} aria-hidden />
        </>
      ) : null}
    </div>
  )
}

export default function TitleCompanySelectionPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const id = dealId ?? 'under-contract-demo'

  const [tab, setTab] = useState<'tract' | 'own'>('tract')
  const [selectedId, setSelectedId] = useState<string>('first-american')
  const [ownName, setOwnName] = useState('')

  const onConfirm = () => {
    if (tab === 'tract') {
      const c = TITLE_COMPANIES.find((x) => x.id === selectedId)
      toast.success(`Contract will be routed to ${c?.name ?? 'selected title company'}.`)
      navigate(`/deals/${id}/emd`, { state: { titleCompany: c?.name ?? 'First American Title' } })
      return
    }
    if (!ownName.trim()) {
      toast.error('Enter your title company name.')
      return
    }
    toast.success(`We'll coordinate with ${ownName.trim()}.`)
    navigate(`/deals/${id}/emd`, { state: { titleCompany: ownName.trim() } })
  }

  const onSaveDraft = () => {
    toast.message('Draft saved.')
  }

  return (
    <div className="min-h-screen bg-[#111417] font-inter text-gray-200">
      <header className="sticky top-0 z-50 border-b border-[#323538] bg-[#111417]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-playfair text-2xl font-bold tracking-tight text-tract-gold">
            TRACT
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              className="font-inter text-base text-[#d0c5af] transition-colors hover:text-tract-gold"
              onClick={() => toast.message('Documents coming soon.')}
            >
              Documents
            </button>
            <span className="border-b-2 border-tract-gold pb-1 font-inter text-base text-tract-gold">Closing status</span>
            <button
              type="button"
              className="font-inter text-base text-[#d0c5af] transition-colors hover:text-tract-gold"
              onClick={() => toast.message('Support coming soon.')}
            >
              Support
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded p-1 text-[#d0c5af] transition-colors hover:text-tract-gold"
              aria-label="Wallet"
            >
              <Wallet className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className="rounded p-1 text-[#d0c5af] transition-colors hover:text-tract-gold"
              aria-label="Help"
            >
              <HelpCircle className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            <div className="h-8 w-8 overflow-hidden rounded-full border border-[#99907c]">
              <img src={HEADER_AVATAR} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-[64px] hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col border-r border-[#323538] bg-[#1D2023] px-4 py-8 lg:flex">
          <div className="mb-10">
            <div className="mb-1 font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] opacity-70">
              Onboarding
            </div>
            <div className="mb-1 font-playfair text-xl font-bold text-tract-gold">Title selection</div>
            <div className="font-inter text-sm text-[#d0c5af]">Step 2 of 4</div>
          </div>
          <nav className="flex flex-grow flex-col gap-2">
            <Link
              to={`/deals/${id}/sign`}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-3 text-[#d0c5af] opacity-60 transition-all hover:bg-[#37393d] hover:opacity-100"
            >
              <FileEdit className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="font-inter text-xs font-bold uppercase tracking-wider">Agreement</span>
            </Link>
            <div className="flex scale-100 cursor-default items-center gap-3 rounded-lg bg-[#733641] p-3 text-[#f4a2ad] transition-transform duration-200 hover:scale-[1.02]">
              <Building2 className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              <span className="font-inter text-xs font-bold uppercase tracking-wider">Title company</span>
            </div>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-[#d0c5af] transition-all hover:bg-[#37393d]"
              onClick={() => toast.message('Escrow step coming soon.')}
            >
              <Wallet className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="font-inter text-xs font-bold uppercase tracking-wider">Escrow</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-[#d0c5af] transition-all hover:bg-[#37393d]"
              onClick={() => toast.message('Final review coming soon.')}
            >
              <BadgeCheck className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="font-inter text-xs font-bold uppercase tracking-wider">Final review</span>
            </button>
          </nav>
          <button
            type="button"
            onClick={onSaveDraft}
            className="mt-auto rounded border border-[#99907c] py-2 font-inter text-sm font-semibold text-gray-200 transition-colors hover:bg-[#37393d]"
          >
            Save draft
          </button>
        </aside>

        <main className="min-h-screen flex-grow bg-[#0B0E11] pb-24 md:pb-0">
          <div className="mx-auto max-w-[760px] px-4 py-10 md:px-0">
            <header className="mb-10 text-center md:text-left">
              <h1 className="mb-2 font-playfair text-3xl font-bold text-gray-100">Assign your title company</h1>
              <p className="mx-auto max-w-[600px] font-inter text-base text-[#d0c5af] md:mx-0">
                The signed contract will be automatically routed to your selected title company. EMD wiring instructions
                will be sent immediately after.
              </p>
            </header>

            <div className="mb-6 flex gap-6 border-b border-[#323538]">
              <button
                type="button"
                onClick={() => setTab('tract')}
                className={cn(
                  'border-b-2 pb-4 font-inter text-xs font-bold uppercase tracking-wider transition-colors',
                  tab === 'tract' ? 'border-tract-gold text-tract-gold' : 'border-transparent text-[#d0c5af] hover:text-gray-100',
                )}
              >
                Choose from TRACT&apos;s list
              </button>
              <button
                type="button"
                onClick={() => setTab('own')}
                className={cn(
                  'border-b-2 pb-4 font-inter text-xs font-bold uppercase tracking-wider transition-colors',
                  tab === 'own' ? 'border-tract-gold text-tract-gold' : 'border-transparent text-[#d0c5af] hover:text-gray-100',
                )}
              >
                Use my own
              </button>
            </div>

            {tab === 'tract' ? (
              <div className="mb-10 flex flex-col gap-4">
                {TITLE_COMPANIES.map((c) => {
                  const selected = selectedId === c.id
                  const Icon = c.Icon
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02]',
                        selected
                          ? 'border-2 border-tract-gold bg-[#272A2E]'
                          : 'group border border-[#323538] bg-[#1D2023] hover:border-tract-gold/50',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#4d4635] bg-[#323538]',
                          !selected && 'group-hover:border-tract-gold/30',
                        )}
                      >
                        <Icon
                          className={cn('h-8 w-8', selected ? 'text-tract-gold' : 'text-[#d0c5af]')}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-inter text-lg font-bold text-gray-100">{c.name}</h3>
                          <span className="inline-flex items-center gap-1 rounded bg-[#95BF78]/20 px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wider text-[#b0db91]">
                            <BadgeCheck className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                            TRACT vetted
                          </span>
                        </div>
                        <div className="mb-2 font-inter text-sm text-[#d0c5af]">{c.location}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StarRow pattern={c.stars} />
                          <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-100">
                            {c.ratingLabel} ({c.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                          selected ? 'border-tract-gold' : 'border-[#4d4635]',
                        )}
                        aria-hidden
                      >
                        {selected ? <div className="h-3 w-3 rounded-full bg-tract-gold" /> : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="mb-10 rounded-xl border border-[#323538] bg-[#1D2023] p-6">
                <label htmlFor="own-title" className="mb-2 block font-inter text-sm font-semibold text-gray-100">
                  Title company name
                </label>
                <input
                  id="own-title"
                  type="text"
                  value={ownName}
                  onChange={(e) => setOwnName(e.target.value)}
                  placeholder="e.g. Chicago Title"
                  className="w-full rounded-lg border border-[#323538] bg-[#0B0E11] px-4 py-3 font-inter text-sm text-gray-100 placeholder:text-gray-500 focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold"
                />
                <p className="mt-3 font-inter text-sm text-[#d0c5af]">
                  TRACT will request wire details from your vendor. Real-time tracker integration may be limited.
                </p>
              </div>
            )}

            <div className="mb-10 flex gap-4 rounded-lg border border-tract-gold/30 bg-tract-gold/10 p-5">
              <Info className="h-6 w-6 shrink-0 text-tract-gold" strokeWidth={2} aria-hidden />
              <p className="font-inter text-sm text-gray-200">
                Selecting a TRACT-vetted title company ensures real-time status tracking and direct API integration for
                secure document handling.
              </p>
            </div>

            <footer className="mt-10">
              <button
                type="button"
                onClick={onConfirm}
                className="h-14 w-full rounded-lg bg-tract-gold font-inter text-base font-semibold text-[#554300] shadow-lg shadow-black/20 transition-all duration-200 hover:bg-[#f2ca50] hover:scale-[1.02] active:scale-[0.98]"
              >
                Confirm &amp; route contract
              </button>
              <p className="mt-4 text-center font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] opacity-60">
                Secure AES-256 encrypted routing
              </p>
            </footer>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[#323538] bg-[#111417] px-4 py-3 md:hidden">
        <Link to="/buyer/dashboard" className="flex flex-col items-center gap-1 text-[#d0c5af]">
          <Home className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link to={`/deals/${id}`} className="flex flex-col items-center gap-1 text-tract-gold">
          <RefreshCw className="h-6 w-6" strokeWidth={2} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">Status</span>
        </Link>
        <button type="button" className="flex flex-col items-center gap-1 text-[#d0c5af]" onClick={() => toast.message('Documents coming soon.')}>
          <FileText className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">Docs</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-[#d0c5af]" onClick={() => toast.message('Profile coming soon.')}>
          <User className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  )
}
