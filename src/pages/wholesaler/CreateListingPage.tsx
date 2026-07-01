import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CirclePlus,
  CloudUpload,
  Eye,
  EyeOff,
  FileText,
  Hammer,
  HardHat,
  Info,
  Loader2,
  Save,
  Upload,
  Video,
  Wrench,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useCreateListing, useListing, usePublishListing, useUpdateListing } from '@/hooks/useListings'
import { APP2_STATES } from '@/lib/constants/states'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'

const STEPS = [
  { id: 'arv', label: 'ARV & Rehab', barLabel: 'ARV & Rehab' },
  { id: 'deal', label: 'Deal Type & Fees', barLabel: 'Deal Type & Fees' },
  { id: 'media', label: 'Media Vault', barLabel: 'Media' },
  { id: 'review', label: 'Review & Publish', barLabel: 'Review' },
] as const

type StepId = (typeof STEPS)[number]['id']

function isMongoId(s: string): boolean {
  return /^[a-f\d]{24}$/i.test(s)
}

function parseStep(raw: string | null): StepId {
  const s = raw ?? 'arv'
  return STEPS.some((x) => x.id === s) ? (s as StepId) : 'arv'
}

function digitsToNumber(s: string): number {
  const d = s.replace(/\D/g, '')
  if (!d) return 0
  const n = Number(d)
  return Number.isFinite(n) ? n : 0
}

type RehabRow = { id: string; label: string; amount: number }

const INITIAL_REHAB: RehabRow[] = [
  { id: 'a', label: 'Roof Repair', amount: 15_000 },
  { id: 'b', label: 'HVAC Replacement', amount: 8_500 },
  { id: 'c', label: 'Kitchen Renovation', amount: 22_000 },
]

function CreateListingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main antialiased">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-app1-border-light bg-app1-bg-card">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link
            to="/wholesaler/dashboard"
            className="font-cinzel text-[24px] font-bold text-app1-primary"
          >
            TRACT
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/buyer/marketplace"
              className="border-b-2 border-app1-secondary pb-1 font-poppins text-base text-app1-secondary transition-colors hover:text-app1-secondary"
            >
              Listings
            </Link>
            <a href="/wholesaler/dashboard" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Portfolio
            </a>
            <a href="/wholesaler/dashboard" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Insights
            </a>
            <a href="mailto:support@tract.com" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Contact
            </a>
          </div>
          <Link
            to="/buyer/marketplace"
            className="rounded bg-app1-secondary px-6 py-2 font-poppins text-sm font-semibold text-[#554300] transition-transform active:scale-95"
          >
            Invest Now
          </Link>
        </div>
      </nav>

      {children}

      <footer className="mt-10 border-t border-app1-border-light bg-app1-bg-card">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-12">
          <span className="font-cinzel text-[20px] font-bold text-app1-primary md:mb-0">TRACT</span>
          <nav className="mb-6 flex flex-wrap justify-center gap-6 md:mb-0">
            {[
              { label: 'Terms of Service', href: '/legal/terms' },
              { label: 'Privacy Policy', href: '/legal/privacy' },
              { label: 'NDA', href: '/legal/nda' },
              { label: 'Legal Notices', href: '/legal/terms' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main">
                {label}
              </a>
            ))}
          </nav>
          <p className="font-poppins text-sm text-app1-text-muted">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function CreateListingStepBar({
  currentStep,
  variant,
}: {
  currentStep: StepId
  variant: 'light' | 'dark'
}) {
  const idx = STEPS.findIndex((s) => s.id === currentStep)
  const safeIdx = idx < 0 ? 0 : idx
  const pct = ((safeIdx + 1) / STEPS.length) * 100
  const isLight = variant === 'light'

  return (
    <div className="mb-10 w-full">
      <div className="mb-2 flex justify-between gap-1 px-0.5 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < safeIdx
          const active = i === safeIdx
          return (
            <div key={s.id} className="flex min-w-0 flex-1 flex-col items-center text-center">
              <div className="mb-1 flex items-center gap-1">
                {done ? (
                  <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-app1-primary" strokeWidth={2} aria-hidden />
                ) : active ? (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-app1-secondary" aria-hidden />
                ) : (
                  <div
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      isLight ? 'bg-app1-border-light' : 'bg-app1-border-light',
                    )}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'truncate font-poppins text-[9px] font-bold uppercase leading-tight tracking-wide sm:text-[12px]',
                    done && (isLight ? 'text-app1-text-muted' : 'text-app1-text-muted'),
                    active && 'text-app1-secondary',
                    !done && !active && (isLight ? 'text-app1-text-muted opacity-80' : 'text-app1-text-muted opacity-50'),
                  )}
                >
                  {s.barLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div
        className={cn(
          'h-1 w-full overflow-hidden rounded-full',
          isLight ? 'bg-app1-border-light' : 'bg-app1-border-light',
        )}
      >
        <div
          className="h-full bg-app1-secondary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const DEAL_TYPES = [
  { id: 'fix_flip', label: 'Fix & Flip', Icon: Hammer },
  { id: 'hold_sell', label: 'Hold & Sell', Icon: Building2 },
  { id: 'full_gut', label: 'Full Gut', Icon: Wrench },
  { id: 'new_construction', label: 'New Construction', Icon: HardHat },
] as const

type DealTypeId = (typeof DEAL_TYPES)[number]['id']

const MAX_VAULT_PHOTOS = 20
const VAULT_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp'

type VaultPhoto = { id: string; src: string; objectUrl?: boolean }
type VaultDisclosure = { id: string; name: string; verified: boolean }

function MediaVaultLinearProgress({ stepNumber1Based, totalSteps }: { stepNumber1Based: number; totalSteps: number }) {
  const pct = Math.round((stepNumber1Based / totalSteps) * 100)
  return (
    <div className="mb-10 w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
          Step {stepNumber1Based} of {totalSteps}
        </span>
        <span className="font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-secondary">{pct}% complete</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-app1-border-light">
        <div className="h-full bg-app1-secondary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ReviewPublishProgress() {
  return (
    <div className="mb-10 w-full rounded-xl border-b border-app1-border-light bg-app1-bg-card px-5 py-4 shadow-app1-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">Step 4 of 4</span>
        <span className="font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-primary">
          Review &amp; Publish
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-app1-border-light">
        <div className="h-full w-full bg-app1-secondary transition-all duration-500" />
      </div>
    </div>
  )
}

const REVIEW_FALLBACK_HERO = DEFAULT_PROPERTY_IMAGE

function CreateListingStickyBar({
  activeStepIndex,
  totalSteps,
  onBack,
  onNext,
  nextLabel,
}: {
  activeStepIndex: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  nextLabel?: string
}) {
  const stepsCompleteLabel = `${activeStepIndex + 1} of ${totalSteps} steps complete`
  const filledDots = activeStepIndex + 1

  return (
    <div className="fixed bottom-0 left-[240px] right-0 z-40 border-t border-app1-border-light bg-app1-bg-card shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-12">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="font-poppins text-sm font-semibold text-app1-text-main">{stepsCompleteLabel}</span>
          <div className="flex gap-2" aria-hidden>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn('h-2 w-2 rounded-full', i < filledDots ? 'bg-app1-secondary' : 'bg-app1-border-light')}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 rounded-lg px-6 py-3 font-poppins text-sm font-semibold text-app1-text-main transition-colors hover:bg-app1-bg-soft"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-lg bg-app1-secondary px-6 py-3 font-poppins text-sm font-semibold text-[#554300] shadow-app1-card transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {nextLabel ?? 'Next step'}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreateListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const fromId = searchParams.get('from') ?? ''
  const step = parseStep(searchParams.get('step'))
  const remoteId = fromId && isMongoId(fromId) ? fromId : undefined

  const [purchaseDigits, setPurchaseDigits] = useState('185000')

  const [arvDigits, setArvDigits] = useState('320000')
  const [rehabRows, setRehabRows] = useState<RehabRow[]>(INITIAL_REHAB)
  const [compsHint, setCompsHint] = useState<string | null>(null)
  const [arvError, setArvError] = useState<string | null>(null)
  const [dealTypeId, setDealTypeId] = useState<DealTypeId>('fix_flip')
  const [marketStatus, setMarketStatus] = useState<'off_market' | 'on_market'>('off_market')
  const [listingStateCode, setListingStateCode] = useState('TX')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [feeLowStr, setFeeLowStr] = useState('')
  const [feeHighStr, setFeeHighStr] = useState('')
  const [dealError, setDealError] = useState<string | null>(null)
  const [vaultPhotos, setVaultPhotos] = useState<VaultPhoto[]>([])
  const [videoLink, setVideoLink] = useState('')
  const [videoDraftName, setVideoDraftName] = useState<string | null>(null)
  const [disclosures, setDisclosures] = useState<VaultDisclosure[]>([])
  const [showPrivateFee, setShowPrivateFee] = useState(false)

  const [savedListingId, setSavedListingId] = useState<string | null>(() =>
    fromId && isMongoId(fromId) ? fromId : null,
  )

  const { data: remoteListing } = useListing(remoteId)
  const createMutation = useCreateListing()
  const updateMutation = useUpdateListing(savedListingId ?? undefined)
  const publishMutation = usePublishListing(savedListingId ?? undefined)

  const hydratedIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!remoteListing || hydratedIdRef.current === remoteListing.id) return
    hydratedIdRef.current = remoteListing.id
    setSavedListingId(remoteListing.id)
    if (remoteListing.arv) setArvDigits(String(Math.round(remoteListing.arv)))
    setDealTypeId(remoteListing.dealType)
    setMarketStatus(remoteListing.marketStatus)
    if (remoteListing.assignmentFeeLow != null) setFeeLowStr(String(remoteListing.assignmentFeeLow))
    if (remoteListing.assignmentFeeHigh != null) setFeeHighStr(String(remoteListing.assignmentFeeHigh))
    if (remoteListing.purchasePrice != null) setPurchaseDigits(String(Math.round(remoteListing.purchasePrice)))
    const br = remoteListing.rehabBreakdown
    if (br && typeof br === 'object' && Object.keys(br).length > 0) {
      setRehabRows(
        Object.entries(br).map(([label, amount], i) => ({
          id: `loaded-${i}`,
          label,
          amount: Number(amount),
        })),
      )
    }
    const photos = remoteListing.photoUrls
    if (photos?.length) {
      setVaultPhotos(photos.map((src, i) => ({ id: `srv-${i}`, src })))
    }
    if (remoteListing.videoUrl) setVideoLink(remoteListing.videoUrl)
    if (remoteListing.stateCode) setListingStateCode(remoteListing.stateCode)
    if (remoteListing.propertyAddress) {
      setPropertyAddress(remoteListing.propertyAddress)
    }
    if (remoteListing.city) {
      setCity(remoteListing.city)
    }
    if (remoteListing.zipCode) {
      setZipCode(remoteListing.zipCode)
    }
  }, [remoteListing])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const vaultPhotoInputRef = useRef<HTMLInputElement>(null)
  const vaultVideoInputRef = useRef<HTMLInputElement>(null)
  const disclosureInputRef = useRef<HTMLInputElement>(null)
  const vaultPhotosRef = useRef(vaultPhotos)
  vaultPhotosRef.current = vaultPhotos

  useEffect(() => {
    return () => {
      vaultPhotosRef.current.forEach((p) => {
        if (p.objectUrl) URL.revokeObjectURL(p.src)
      })
    }
  }, [])

  const arv = arvDigits === '' ? 0 : Number(arvDigits) || 0
  const rehabTotal = useMemo(() => rehabRows.reduce((sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0), 0), [rehabRows])

  const purchasePrice = digitsToNumber(purchaseDigits)
  const projectedProfit = arv - purchasePrice - rehabTotal

  const showLowRehabWarning = arv > 0 && rehabTotal < arv * 0.05

  const arvDisplay = arvDigits ? Number(arvDigits).toLocaleString('en-US') : ''

  const persistQuery = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    if (fromId) next.set('from', fromId)
    return next
  }, [fromId, searchParams])

  const goToStep = (next: StepId) => {
    const q = persistQuery()
    q.set('step', next)
    setSearchParams(q)
  }

  const handleNext = () => {
    if (arv <= 0) {
      setArvError('Enter a valid After-Repair Value.')
      return
    }
    if (!propertyAddress.trim()) {
      setArvError('Property address is required.')
      return
    }
    if (!city.trim()) {
      setArvError('City is required.')
      return
    }
    setArvError(null)
    goToStep('deal')
  }

  const parseMoneyInput = (s: string) => {
    const n = Number.parseFloat(s.replace(/,/g, ''))
    return Number.isFinite(n) ? n : NaN
  }

  const handleDealBack = () => {
    setDealError(null)
    goToStep('arv')
  }

  const handleDealNext = () => {
    const low = parseMoneyInput(feeLowStr)
    const high = parseMoneyInput(feeHighStr)
    if (feeLowStr.trim() !== '' && feeHighStr.trim() !== '' && !Number.isNaN(low) && !Number.isNaN(high) && high < low) {
      setDealError('Market price must be greater than or equal to minimum price.')
      return
    }
    setDealError(null)
    goToStep('media')
  }

  const handleMediaBack = () => goToStep('deal')
  const handleMediaNext = () => goToStep('review')
  const handleReviewBack = () => goToStep('media')

  const buildPayload = (): Record<string, unknown> => {
    const low = parseMoneyInput(feeLowStr)
    const high = parseMoneyInput(feeHighStr)
    const rehabBreakdown: Record<string, number> = {}
    for (const r of rehabRows) {
      const lab = r.label.trim()
      if (lab && r.amount > 0) rehabBreakdown[lab] = r.amount
    }
    const effectiveHigh = feeHighStr.trim() !== '' && !Number.isNaN(high) ? high : 35_000
    const effectiveLow =
      feeLowStr.trim() !== '' && !Number.isNaN(low) ? low : Math.round(effectiveHigh * 0.85)
    const photoUrls = vaultPhotos.map((p) => p.src).filter((s) => /^https?:\/\//i.test(s))

    return {
      dealType: dealTypeId,
      marketStatus,
      propertyAddress: propertyAddress.trim(),
      city: city.trim(),
      stateCode: listingStateCode || 'TX',
      zipCode: zipCode.trim() || '00000',
      arv,
      rehabTotal,
      rehabBreakdown: Object.keys(rehabBreakdown).length ? rehabBreakdown : undefined,
      purchasePrice,
      estimatedHoldingCosts: 0,
      assignmentFeeLow: effectiveLow,
      assignmentFeeHigh: effectiveHigh,
      photoUrls: photoUrls.length ? photoUrls : undefined,
      videoUrl: videoLink.trim() || undefined,
    }
  }

  const saveDraft = async (): Promise<string | null> => {
    const payload = buildPayload()
    try {
      if (savedListingId) {
        await updateMutation.mutateAsync(payload)
        return savedListingId
      }
      const created = await createMutation.mutateAsync(payload)
      setSavedListingId(created.id)
      const q = persistQuery()
      q.set('from', created.id)
      setSearchParams(q)
      return created.id
    } catch {
      return null
    }
  }

  const handlePublishClick = async () => {
    try {
      let listingId = savedListingId
      if (!listingId) {
        listingId = await saveDraft()
      }

      if (!listingId) {
        toast.error('Failed to save listing. Please try again.')
        return
      }

      await publishMutation.mutateAsync(listingId)
    } catch (err) {
      console.error('Publish failed:', err)
    }
  }

  const removeVaultPhoto = (id: string) => {
    setVaultPhotos((prev) => {
      const found = prev.find((p) => p.id === id)
      if (found?.objectUrl) URL.revokeObjectURL(found.src)
      return prev.filter((p) => p.id !== id)
    })
  }

  const addVaultPhotos = (files: FileList | null) => {
    if (!files?.length) return
    const images = Array.from(files).filter((f) => /jpeg|png|webp/i.test(f.type))
    setVaultPhotos((prev) => {
      const room = MAX_VAULT_PHOTOS - prev.length
      if (room <= 0) return prev
      const next = images.slice(0, room).map((f) => ({
        id: crypto.randomUUID(),
        src: URL.createObjectURL(f),
        objectUrl: true as const,
      }))
      return [...prev, ...next]
    })
  }

  const onVaultVideoPicked = (files: FileList | null) => {
    const f = files?.[0]
    if (!f || !/^video\//i.test(f.type)) return
    setVideoDraftName(f.name)
  }

  const addDisclosureFiles = (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files)
    setDisclosures((prev) => [
      ...prev,
      ...list.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        verified: true,
      })),
    ])
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const safeStepIndex = stepIndex < 0 ? 0 : stepIndex

  const onPickFiles = (files: FileList | null) => {
    if (!files?.length) return
    setCompsHint(`${files.length} file${files.length === 1 ? '' : 's'} attached (draft only)`)
  }

  const updateRow = (id: string, patch: Partial<Pick<RehabRow, 'label' | 'amount'>>) => {
    setRehabRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const addRow = () => {
    setRehabRows((rows) => [
      ...rows,
      { id: crypto.randomUUID(), label: 'New line item', amount: 0 },
    ])
  }

  const formulaLine = `ARV ${formatCurrency(arv)} − Purchase ${formatCurrency(purchasePrice)} − Rehab ${formatCurrency(rehabTotal)}`

  const progressVariant = 'light' as const
  const showVaultSticky = step === 'media'

  const dealTypeLabel = DEAL_TYPES.find((d) => d.id === dealTypeId)?.label ?? 'Fix & Flip'
  const marketLabelShort = marketStatus === 'off_market' ? 'Off-Market' : 'On-Market'
  const marketLabelFull =
    marketStatus === 'off_market' ? 'Off-Market' : 'On-Market (Realtors Only)'
  const publicFeeParsed = parseMoneyInput(feeHighStr)
  const publicFeeDisplay =
    feeHighStr.trim() !== '' && !Number.isNaN(publicFeeParsed)
      ? publicFeeParsed
      : 35_000
  const privateFeeParsed = parseMoneyInput(feeLowStr)
  const hasPrivateFee = feeLowStr.trim() !== '' && !Number.isNaN(privateFeeParsed)

  const listingAddress = propertyAddress.trim()
    ? [propertyAddress.trim(), city.trim(), listingStateCode].filter(Boolean).join(', ')
    : remoteListing?.propertyAddress
      ? [remoteListing.propertyAddress, remoteListing.city, remoteListing.stateCode]
          .filter(Boolean)
          .join(', ')
      : 'Property address pending'
  const previewHeroSrc =
    vaultPhotos[0]?.src ?? remoteListing?.photoUrls?.[0] ?? REVIEW_FALLBACK_HERO

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <CreateListingShell>
          <>
            <main
          className={cn(
            'flex w-full flex-1 flex-col pt-[100px] px-4 md:px-12',
            showVaultSticky ? 'pb-40' : 'pb-10',
            'bg-app1-bg-main text-app1-text-main',
          )}
        >
          <div className="mx-auto w-full max-w-[800px]">
            {step === 'arv' || step === 'deal' ? (
              <CreateListingStepBar currentStep={step} variant={progressVariant} />
            ) : step === 'review' ? (
              <ReviewPublishProgress />
            ) : (
              <MediaVaultLinearProgress stepNumber1Based={safeStepIndex + 1} totalSteps={STEPS.length} />
            )}

          {step === 'arv' ? (
            <>
              <h1 className="mb-6 font-cinzel text-[28px] font-bold text-app1-primary">Property Valuation</h1>

              <section className="mb-6 rounded-xl border border-app1-border-light/40 bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:border-app1-secondary md:p-8">
                <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="arv-input" className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
                      After-Repair Value (ARV) <span className="text-app1-danger">*</span>
                    </label>
                    <div className="flex items-baseline border-b-2 border-app1-secondary pb-1">
                      <span className="shrink-0 font-cinzel text-[40px] font-bold text-app1-text-main">$</span>
                      <input
                        id="arv-input"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-invalid={Boolean(arvError)}
                        aria-describedby={arvError ? 'arv-err' : undefined}
                        placeholder="320,000"
                        value={arvDisplay}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '')
                          setArvDigits(raw)
                        }}
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 font-cinzel text-[40px] font-bold text-app1-text-main placeholder:text-gray-300 focus:outline-none focus:ring-0"
                      />
                    </div>
                    {arvError ? (
                      <p id="arv-err" className="mt-2 font-poppins text-sm text-app1-danger">
                        {arvError}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-app1-primary px-6 py-3 font-poppins text-sm font-semibold text-app1-primary transition-colors hover:bg-app1-primary/10"
                  >
                    <Upload className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Upload Comps
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,image/*"
                  multiple
                  onChange={(e) => onPickFiles(e.target.files)}
                />

                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onPickFiles(e.dataTransfer.files)
                  }}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-app1-primary/30 bg-app1-primary/10 p-8 text-center transition-colors hover:border-app1-primary"
                >
                  <div className="mb-4 rounded-full bg-app1-primary p-2 text-white transition-transform group-hover:scale-110">
                    <CloudUpload className="h-6 w-6" strokeWidth={2} aria-hidden />
                  </div>
                  <h4 className="font-poppins text-lg font-semibold text-app1-text-main">
                    Upload comparable sales (PDF or photos)
                  </h4>
                  <p className="mt-1 font-poppins text-sm text-app1-text-muted">Click or drag to upload</p>
                  {compsHint ? <p className="mt-3 font-poppins text-sm text-app1-primary">{compsHint}</p> : null}
                </div>
              </section>

              <section className="mb-6 rounded-xl border border-app1-border-light/40 bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:border-app1-secondary md:p-8">
                <h3 className="mb-4 font-cinzel text-[20px] font-bold text-app1-primary">Property location</h3>
                <div className="mb-4">
                  <label
                    htmlFor="property-address"
                    className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted"
                  >
                    Property Address <span className="text-app1-danger">*</span>
                  </label>
                  <input
                    id="property-address"
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="e.g. 4821 Maple Drive"
                    className="w-full rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="listing-city"
                    className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted"
                  >
                    City <span className="text-app1-danger">*</span>
                  </label>
                  <input
                    id="listing-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Austin"
                    className="w-full rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="listing-zip"
                    className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted"
                  >
                    ZIP Code
                  </label>
                  <input
                    id="listing-zip"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 78701"
                    maxLength={10}
                    className="w-full rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary"
                  />
                </div>
                <label htmlFor="listing-state" className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
                  State <span className="text-app1-danger">*</span>
                </label>
                <select
                  id="listing-state"
                  value={listingStateCode}
                  onChange={(e) => setListingStateCode(e.target.value)}
                  className="h-[48px] w-full max-w-md cursor-pointer rounded-lg border border-tract-graphite/30 bg-app1-bg-card px-4 font-poppins text-[16px] text-app1-text-main outline-none transition-colors focus:border-app1-secondary"
                >
                  <option value="">Select state</option>
                  {APP2_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </section>

              <section className="mb-6 rounded-xl border border-app1-border-light/40 bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:border-app1-secondary md:p-8">
                <h3 className="mb-6 font-cinzel text-[20px] font-bold text-app1-primary">Rehab Cost Estimate</h3>
                <div className="mb-6 overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-app1-border-light">
                        <th className="py-4 text-left font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                          Item
                        </th>
                        <th className="py-4 text-right font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                          Estimated cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="font-poppins text-base text-app1-text-main">
                      {rehabRows.map((row) => (
                        <tr key={row.id} className="border-b border-app1-border-light">
                          <td className="py-3 pr-2">
                            <input
                              value={row.label}
                              onChange={(e) => updateRow(row.id, { label: e.target.value })}
                              className="w-full min-w-0 border-0 bg-transparent p-0 font-poppins text-base focus:outline-none focus:ring-0"
                              aria-label={`Rehab item ${row.label}`}
                            />
                          </td>
                          <td className="py-3 text-right">
                            <input
                              inputMode="numeric"
                              value={row.amount ? row.amount.toLocaleString('en-US') : ''}
                              onChange={(e) => {
                                const n = digitsToNumber(e.target.value)
                                updateRow(row.id, { amount: n })
                              }}
                              className="w-full max-w-[10rem] border-0 bg-transparent p-0 text-right font-poppins text-sm font-semibold tracking-wide focus:outline-none focus:ring-0"
                              aria-label={`Cost for ${row.label}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 font-poppins text-sm font-semibold text-app1-secondary hover:underline"
                  >
                    <CirclePlus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                    + Add line item
                  </button>
                  <div className="flex items-center gap-6">
                    <span className="font-poppins text-base font-bold text-app1-text-main">Total rehab cost:</span>
                    <span className="font-cinzel text-[24px] font-bold text-app1-text-main">{formatCurrency(rehabTotal)}</span>
                  </div>
                </div>

                {showLowRehabWarning ? (
                  <div className="flex gap-3 rounded-xl border border-tract-orange bg-tract-orange/10 p-4">
                    <AlertTriangle className="h-6 w-6 shrink-0 text-tract-orange" strokeWidth={2} aria-hidden />
                    <p className="font-poppins text-sm text-tract-orange">
                      Rehab is under 5% of ARV — this outlier may be flagged for admin review before the listing goes live.
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="mb-6 rounded-xl border border-app1-border-light/40 bg-app1-bg-card p-6 shadow-app1-card md:p-8">
                <h3 className="mb-4 font-cinzel text-[18px] font-bold text-app1-primary">Purchase Price</h3>
                <div className="grid gap-4 sm:grid-cols-1">
                  <div>
                    <label className="mb-1 block font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted">
                      Purchase price
                    </label>
                    <input
                      inputMode="numeric"
                      value={purchaseDigits ? Number(purchaseDigits).toLocaleString('en-US') : ''}
                      onChange={(e) => setPurchaseDigits(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-lg border border-app1-border-light px-3 py-2 font-poppins text-sm"
                    />
                  </div>
                </div>
              </section>

              <section className="relative mb-10 overflow-hidden rounded-xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
                <div className="relative z-10">
                  <label className="mb-2 block font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
                    Projected buyer profit
                  </label>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="font-cinzel text-[56px] font-bold leading-none text-app1-secondary">
                      {formatCurrency(projectedProfit)}
                    </span>
                    <span className="inline-flex text-app1-secondary/50" aria-label="Informational estimate">
                      <Info className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                    </span>
                  </div>
                  <p className="mb-4 border-t border-app1-border-light pt-4 font-poppins text-sm text-app1-text-muted">{formulaLine}</p>
                  <p className="font-poppins text-[12px] italic text-app1-text-muted/80">
                    This figure is locked and displayed on your public listing.
                  </p>
                </div>
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-app1-secondary opacity-5 blur-3xl" aria-hidden />
              </section>

              <div className="flex flex-col gap-4 border-t border-app1-border-light pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  onClick={() => void saveDraft()}
                  className="flex items-center gap-1 font-poppins text-sm font-semibold text-app1-text-muted transition-colors hover:text-app1-text-main disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  )}
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 rounded-xl bg-app1-secondary px-8 py-4 font-poppins text-sm font-semibold text-black shadow-lg shadow-app1-secondary/20 transition-all hover:brightness-110 active:scale-95"
                >
                  Next step
                  <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </>
          ) : null}

          {step === 'deal' ? (
            <>
              <h1 className="mb-6 font-cinzel text-[32px] font-bold leading-tight text-app1-primary">Deal Structure</h1>

              <section className="mb-6 rounded-xl border border-app1-border-light bg-app1-bg-soft p-6 md:p-8">
                <p className="mb-6 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
                  Select deal type
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {DEAL_TYPES.map(({ id, label, Icon }) => {
                    const selected = dealTypeId === id
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setDealTypeId(id)}
                        className={cn(
                          'flex items-center rounded-lg p-6 text-left transition-transform active:scale-[0.98]',
                          selected
                            ? 'border-2 border-app1-secondary bg-app1-bg-soft'
                            : 'border border-app1-border-light bg-app1-bg-soft hover:border-gray-500',
                        )}
                      >
                        <div
                          className={cn(
                            'mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            selected ? 'bg-app1-secondary/10' : 'bg-app1-bg-soft',
                          )}
                        >
                          <Icon
                            className={cn('h-5 w-5', selected ? 'text-app1-secondary' : 'text-app1-text-muted')}
                            strokeWidth={2}
                            aria-hidden
                          />
                        </div>
                        <span className="font-poppins text-base font-bold text-app1-text-main">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="mb-6">
                <p className="mb-3 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
                  Market status
                </p>
                <div className="mb-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setMarketStatus('off_market')}
                    className={cn(
                      'rounded-full px-6 py-2 font-poppins text-sm font-semibold transition-colors',
                      marketStatus === 'off_market'
                        ? 'bg-app1-bg-soft text-app1-text-main'
                        : 'border border-app1-border-light bg-app1-bg-soft text-app1-text-muted hover:bg-app1-bg-soft',
                    )}
                  >
                    Off-Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketStatus('on_market')}
                    className={cn(
                      'rounded-full px-6 py-2 font-poppins text-sm font-semibold transition-colors',
                      marketStatus === 'on_market'
                        ? 'bg-app1-bg-soft text-app1-text-main'
                        : 'border border-app1-border-light bg-app1-bg-soft text-app1-text-muted hover:bg-app1-bg-soft',
                    )}
                  >
                    On-Market (Realtors Only)
                  </button>
                </div>
                <p className="font-poppins text-sm italic text-app1-text-muted">
                  On-Market status is only available for Licensed Realtors.
                </p>
              </section>

              <section className="mb-10 rounded-xl border border-app1-border-light bg-app1-bg-soft p-6 md:p-8">
                <h2 className="mb-6 font-cinzel text-[20px] font-bold text-app1-primary">Pricing</h2>
                <div className="mb-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <label htmlFor="fee-low" className="font-poppins text-base font-bold text-app1-text-main">
                        Minimum Price
                      </label>
                      <span className="font-poppins text-sm italic text-app1-danger">Your private reserve — never shown to buyers</span>
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-app1-text-muted">$</span>
                      <input
                        id="fee-low"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0.00"
                        value={feeLowStr}
                        onChange={(e) => setFeeLowStr(e.target.value)}
                        className="w-full rounded-r-lg border-b border-l-4 border-b-app1-border-light border-l-app1-danger bg-app1-bg-soft py-3 pl-10 pr-4 font-poppins text-base text-app1-text-main placeholder:text-app1-text-muted focus:border-b-app1-secondary focus:outline-none"
                      />
                    </div>
                    <p className="font-poppins text-[11px] text-app1-text-muted mt-1">
                      This is your hidden reserve. Bids below this price are automatically blocked. Buyers never see this number.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <label htmlFor="fee-high" className="font-poppins text-base font-bold text-app1-text-main">
                        Market Price
                      </label>
                      <span className="font-poppins text-sm italic text-app1-primary">Publicly visible asking price</span>
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-app1-text-muted">$</span>
                      <input
                        id="fee-high"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0.00"
                        value={feeHighStr}
                        onChange={(e) => setFeeHighStr(e.target.value)}
                        className="w-full rounded-r-lg border-b border-l-4 border-b-app1-border-light border-l-app1-secondary bg-app1-bg-soft py-3 pl-10 pr-4 font-poppins text-base text-app1-text-main placeholder:text-app1-text-muted focus:border-b-app1-secondary focus:outline-none"
                      />
                    </div>
                    <p className="font-poppins text-[11px] text-app1-text-muted mt-1">
                      This is the price shown to buyers on the marketplace.
                    </p>
                  </div>
                </div>

                {dealError ? (
                  <p className="mb-4 font-poppins text-sm text-app1-danger" role="alert">
                    {dealError}
                  </p>
                ) : null}

                <div className="flex gap-3 rounded-lg bg-app1-primary/15 p-4">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-app1-primary" strokeWidth={2} aria-hidden />
                  <p className="font-poppins text-sm text-app1-text-muted">
                    Buyers will only see your <span className="font-bold">Market Price</span>. Your minimum price is
                    your private reserve — never revealed.
                  </p>
                </div>
              </section>

              <div className="flex flex-col gap-4 border-t border-app1-border-light pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleDealBack}
                  className="flex items-center gap-1 font-poppins text-sm font-semibold text-app1-text-muted transition-colors hover:text-app1-text-main"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleDealNext}
                  className="flex items-center justify-center gap-2 rounded-xl bg-app1-secondary px-8 py-3 font-poppins text-sm font-semibold uppercase tracking-wide text-[#554300] transition-transform active:scale-95"
                >
                  Next step
                  <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </>
          ) : null}

          {step === 'media' ? (
            <>
              <h1 className="mb-10 font-cinzel text-[32px] font-bold leading-tight text-app1-primary">Media &amp; Documents</h1>

              <section className="mb-6 rounded-xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:border-app1-secondary md:p-8">
                <h2 className="mb-6 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">Property photos</h2>
                <input
                  ref={vaultPhotoInputRef}
                  type="file"
                  className="sr-only"
                  accept={VAULT_PHOTO_ACCEPT}
                  multiple
                  onChange={(e) => {
                    addVaultPhotos(e.target.files)
                    e.target.value = ''
                  }}
                />
                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {vaultPhotos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg">
                      <img src={photo.src} alt="Property listing photo" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeVaultPhoto(photo.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-red-600"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  ))}
                  {vaultPhotos.length < MAX_VAULT_PHOTOS ? (
                    <button
                      type="button"
                      onClick={() => vaultPhotoInputRef.current?.click()}
                      className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#4d4635]/40 bg-[#F9FAFB] transition-colors hover:border-app1-secondary"
                    >
                      <CirclePlus className="mb-1 h-8 w-8 text-app1-secondary" strokeWidth={1.75} aria-hidden />
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">Add photo</span>
                    </button>
                  ) : null}
                </div>
                <p className="font-poppins text-sm text-app1-text-muted">Upload up to 20 photos (JPG, PNG or WEBP)</p>
              </section>

              <section className="mb-6 rounded-xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:border-app1-secondary md:p-8">
                <h2 className="mb-6 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">Video walkthrough</h2>
                <input
                  ref={vaultVideoInputRef}
                  type="file"
                  className="sr-only"
                  accept="video/mp4,video/quicktime"
                  onChange={(e) => {
                    onVaultVideoPicked(e.target.files)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => vaultVideoInputRef.current?.click()}
                  className="mb-6 flex h-[min(400px,55vh)] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#4d4635]/40 bg-[#F9FAFB] transition-colors hover:border-app1-secondary hover:bg-app1-bg-soft"
                >
                  <Video className="mb-4 h-14 w-14 text-app1-secondary" strokeWidth={1.25} aria-hidden />
                  <p className="mb-1 font-poppins text-base font-semibold text-app1-text-main">Upload walkthrough video</p>
                  <p className="font-poppins text-sm text-app1-text-muted">MP4 up to 500MB • Recommended 1080p</p>
                  {videoDraftName ? (
                    <p className="mt-3 font-poppins text-sm text-app1-primary">Selected: {videoDraftName}</p>
                  ) : null}
                </button>
                <div className="flex flex-col gap-1">
                  <label htmlFor="video-link" className="font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">
                    Or paste a link
                  </label>
                  <input
                    id="video-link"
                    type="url"
                    autoComplete="off"
                    placeholder="https://youtube.com/..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    className="w-full border-0 border-b border-gray-300 bg-[#F9FAFB] py-3 font-poppins text-base text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-0"
                  />
                </div>
              </section>

              <section className="mb-6 rounded-xl border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:border-app1-secondary md:p-8">
                <h2 className="mb-6 font-poppins text-[12px] font-bold uppercase tracking-widest text-app1-text-muted">Seller disclosures</h2>
                <input
                  ref={disclosureInputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => {
                    addDisclosureFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
                <div className="mb-8 flex flex-col gap-4">
                  {disclosures.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-lg border border-app1-border-light bg-[#F9FAFB] p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-6 w-6 shrink-0 text-app1-text-muted" strokeWidth={1.75} aria-hidden />
                        <span className="truncate font-poppins text-base font-semibold text-app1-text-main">{d.name}</span>
                      </div>
                      {d.verified ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-app1-primary/10 px-2 py-1 font-poppins text-xs font-bold text-app1-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                          Verified
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => disclosureInputRef.current?.click()}
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#4d4635]/40 bg-[#F9FAFB] p-6 transition-colors hover:border-app1-secondary"
                >
                  <Upload className="h-6 w-6 text-app1-text-muted" strokeWidth={1.75} aria-hidden />
                  <span className="font-poppins text-base font-semibold text-app1-text-muted">Upload additional disclosures</span>
                </button>
              </section>
            </>
          ) : null}

          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={handleReviewBack}
                className="mb-6 flex items-center gap-2 font-poppins text-sm font-semibold text-app1-text-muted transition-colors hover:text-app1-text-main"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                Back to media vault
              </button>

              <div className="mb-10">
                <h1 className="mb-1 font-cinzel text-[24px] font-bold text-app1-primary">Review your listing</h1>
                <p className="font-poppins text-base text-app1-text-muted">This is exactly how your listing will appear to verified buyers.</p>
              </div>

              <div className="mb-6 overflow-hidden rounded-xl border border-app1-border-light/80 bg-app1-bg-card shadow-md transition-transform duration-300 hover:scale-[1.01]">
                <div className="relative h-[200px]">
                  <img src={previewHeroSrc} alt="Property preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h2 className="font-cinzel text-[20px] font-bold leading-snug text-white">{listingAddress}</h2>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-sm bg-tract-burgundy px-2 py-1 font-poppins text-[10px] font-bold uppercase tracking-widest text-white">
                      {dealTypeLabel}
                    </span>
                    <span className="rounded-sm bg-tract-obsidian px-2 py-1 font-poppins text-[10px] font-bold uppercase tracking-widest text-white">
                      {marketLabelShort}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-8 border-y border-app1-border-light py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">ARV</span>
                      <span className="font-poppins text-sm font-semibold tracking-wide text-app1-text-main">{formatCurrency(arv)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">Rehab</span>
                      <span className="font-poppins text-sm font-semibold tracking-wide text-app1-text-main">
                        {formatCurrency(rehabTotal)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">Fee</span>
                      <span className="font-poppins text-sm font-semibold tracking-wide text-app1-text-main">
                        {formatCurrency(publicFeeDisplay)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div>
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                        Projected buyer profit
                      </span>
                      <div className="font-cinzel text-[24px] font-bold text-app1-secondary">{formatCurrency(projectedProfit)}</div>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-sm bg-app1-primary/10 px-2 py-1.5">
                      <BadgeCheck className="h-4 w-4 text-app1-primary" strokeWidth={2} aria-hidden />
                      <span className="font-poppins text-[11px] font-bold uppercase tracking-wide text-app1-primary">
                        Verified listing
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-4 rounded-xl border border-app1-border-light/80 bg-app1-bg-card p-6 shadow-app1-card md:p-8">
                {(
                  [
                    ['ARV', formatCurrency(arv)],
                    ['Rehab estimate', formatCurrency(rehabTotal)],
                    ['Projected profit', formatCurrency(projectedProfit), true],
                    ['Deal type', dealTypeLabel],
                    ['Market status', marketLabelFull],
                    ['Market Price', formatCurrency(publicFeeDisplay)],
                  ] as const
                ).map(([label, value, gold]) => (
                  <div
                    key={label}
                    className="grid grid-cols-2 gap-y-1 border-b border-app1-border-light pb-4 last:border-0 last:pb-0"
                  >
                    <div className="font-poppins text-sm text-app1-text-muted">{label}</div>
                    <div
                      className={cn(
                        'text-right font-poppins text-base font-bold text-app1-text-main',
                        gold && 'text-app1-secondary',
                      )}
                    >
                      {value}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-y-1 border-b border-app1-border-light pb-4 last:border-0 last:pb-0">
                  <div className="font-poppins text-sm text-app1-text-muted">Minimum Price</div>
                  <div className="flex items-center justify-end gap-2">
                    {showPrivateFee && hasPrivateFee ? (
                      <span className="font-poppins text-base font-bold text-app1-text-main">
                        {formatCurrency(privateFeeParsed)}
                      </span>
                    ) : (
                      <span className="font-poppins text-base font-bold tracking-[0.35em] text-app1-text-main">••••••</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPrivateFee((v) => !v)}
                      className="rounded p-1 text-app1-text-muted transition-colors hover:text-app1-secondary"
                      aria-label={showPrivateFee ? 'Hide private fee' : 'Reveal private fee'}
                    >
                      {showPrivateFee ? (
                        <EyeOff className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-app1-card border border-app1-secondary/30 bg-app1-secondary/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="font-poppins text-[20px] leading-none">💡</span>
                  <div>
                    <p className="font-poppins text-[13px] font-bold text-app1-text-main">TRACT SaaS Technology Fee</p>
                    <p className="mt-1 font-poppins text-[13px] text-app1-text-muted">
                      A flat <span className="font-bold text-app1-secondary">$500.00 USD</span> technology fee applies per
                      transaction initiated on the platform. This fee is collected at closing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 flex gap-3 rounded-lg border border-app1-primary/20 bg-app1-primary/10 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-app1-primary" strokeWidth={2} aria-hidden />
                <p className="font-poppins text-sm text-app1-primary">
                  After publishing, your listing enters a 5-minute compliance review. It will go live automatically if no
                  issues are detected.
                </p>
              </div>

              <div className="space-y-4 pb-4">
                <button
                  type="button"
                  disabled={
                    publishMutation.isPending ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  onClick={() => void handlePublishClick()}
                  className="flex h-16 w-full items-center justify-center bg-app1-secondary font-poppins text-sm font-bold uppercase tracking-[0.2em] text-black shadow-lg transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishMutation.isPending
                    ? 'Publishing...'
                    : createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : 'PUBLISH TO MARKETPLACE'}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    onClick={() => void saveDraft()}
                    className="font-poppins text-sm text-app1-text-muted underline decoration-1 underline-offset-4 transition-colors hover:text-app1-text-main disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving…' : 'Save as draft'}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
        </main>
          </>
        </CreateListingShell>
        {showVaultSticky ? (
          <CreateListingStickyBar
            activeStepIndex={safeStepIndex}
            totalSteps={STEPS.length}
            onBack={handleMediaBack}
            onNext={handleMediaNext}
          />
        ) : null}
      </div>
    </DashboardLayout>
  )
}
