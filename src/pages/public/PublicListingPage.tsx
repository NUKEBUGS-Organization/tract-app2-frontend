import { useState } from 'react'
import { BarChart3, ChevronLeft, ChevronRight, Gavel, Hammer, Loader2, MapPin, Tag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import ShareListingButton from '@/components/shared/ShareListingButton'
import { useListing } from '@/hooks/useListings'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { roleHomePath } from '@/lib/roleHome'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { DealType } from '@/types'

const DEAL_TYPE_LABELS: Record<DealType, string> = {
  fix_flip: 'Fix & Flip',
  hold_sell: 'Hold & Sell',
  full_gut: 'Full Gut',
  new_construction: 'New Construction',
}

function Fact({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
      <div className="flex items-center gap-2 text-app1-text-muted">
        <Icon className="h-4 w-4 text-app1-secondary" strokeWidth={1.75} aria-hidden />
        <span className="font-poppins text-[11px] font-black uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="mt-2 break-words font-cinzel text-xl font-black text-app1-text-main">{value}</p>
    </div>
  )
}

/** Shareable, unauthenticated view of a live listing — reached from social share links. */
export default function PublicListingPage() {
  const { id } = useParams<{ id: string }>()
  const { data: listing, isLoading, isError } = useListing(id)
  const { user, isAuthenticated } = useAuthStore()
  const [photoIndex, setPhotoIndex] = useState(0)

  const isAvailable = listing?.status === 'live'
  const photos = listing?.photoUrls?.filter(Boolean) ?? []
  const heroImage = photos[photoIndex] ?? DEFAULT_PROPERTY_IMAGE
  const title = listing ? `${listing.propertyAddress}, ${listing.city}, ${listing.stateCode}` : ''
  const signedIn = isAuthenticated && user
  const inAppPath =
    signedIn && user.role === 'buyer' ? `/buyer/listings/${id}` : signedIn ? roleHomePath(user.role) : null

  return (
    <div className="min-h-screen bg-app1-bg-main px-4 py-8 font-poppins md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link to="/login" aria-label="TRACT home">
            <BrandMark showSlogan={false} />
          </Link>
          {listing && isAvailable && id ? <ShareListingButton listingId={id} title={title} /> : null}
        </header>

        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-app1-secondary" aria-hidden />
          </div>
        ) : null}

        {!isLoading && (isError || !listing || !isAvailable) ? (
          <div className="mx-auto max-w-md rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 text-center shadow-app1-card">
            <h1 className="font-cinzel text-2xl font-black text-app1-primary">Property unavailable</h1>
            <p className="mt-3 text-sm text-app1-text-muted">
              This property is no longer accepting bids or the link is invalid.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-12 items-center justify-center bg-app1-secondary px-6 text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark"
            >
              Sign in to TRACT
            </Link>
          </div>
        ) : null}

        {listing && isAvailable ? (
          <article className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
            <div className="relative aspect-[16/9] bg-app1-bg-soft">
              <img src={heroImage} alt={`${title} photo`} className="h-full w-full object-cover" />
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                    {photoIndex + 1} / {photos.length}
                  </span>
                </>
              ) : null}
            </div>

            <div className="p-6 md:p-10">
              <span className="inline-flex rounded-full bg-app1-primary px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                Live listing
              </span>
              <h1 className="mt-4 font-cinzel text-3xl font-black leading-tight text-app1-primary md:text-[34px]">
                {title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-app1-text-muted">
                <MapPin className="h-4 w-4" aria-hidden />
                ZIP {listing.zipCode}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Fact icon={Tag} label="Market Price" value={formatCurrency(listing.assignmentFeeHigh)} />
                <Fact icon={BarChart3} label="ARV" value={formatCurrency(listing.arv)} />
                <Fact icon={Hammer} label="Deal Type" value={DEAL_TYPE_LABELS[listing.dealType] ?? '—'} />
                <Fact icon={Gavel} label="Bids" value={String(listing.bidCount ?? 0)} />
              </div>

              <div className="mt-10 flex flex-col gap-4 rounded-xl bg-app1-primary p-6 text-white md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-cinzel text-xl font-black">Interested in this deal?</p>
                  <p className="mt-1 text-sm text-white/70">
                    Bidding, documents and deal details are available to verified TRACT buyers.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  {inAppPath ? (
                    <Link
                      to={inAppPath}
                      className="inline-flex h-12 items-center bg-app1-secondary px-5 text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark"
                    >
                      View in TRACT
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex h-12 items-center bg-app1-secondary px-5 text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark"
                      >
                        Join TRACT
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex h-12 items-center border border-white/30 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white"
                      >
                        Sign in
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  )
}
