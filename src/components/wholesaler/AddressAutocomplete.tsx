import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Home, Loader2, MapPin, Search } from 'lucide-react'
import { isAxiosError } from 'axios'
import {
  searchPropertyAddresses,
  selectPropertyAddress,
  type AddressSuggestion,
  type PropertyLookupResult,
} from '@/lib/propertyData'
import { cn, formatCurrency } from '@/lib/utils'

export type AddressPrefill = {
  propertyAddress: string
  city: string
  stateCode: string
  zipCode: string
}

type Props = {
  propertyAddress: string
  city: string
  stateCode: string
  zipCode: string
  onPrefill: (fields: AddressPrefill) => void
  onAddressChange: (value: string) => void
  disabled?: boolean
}

const MIN_ADDRESS_SEARCH_CHARS = 5
const ADDRESS_SEARCH_DEBOUNCE_MS = 700

function createSessionToken() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatMoney(value: number | null | undefined) {
  if (value === undefined || value === null) return '—'
  return formatCurrency(value)
}

function formatNumber(value: number | null | undefined) {
  if (value === undefined || value === null) return '—'
  return value.toLocaleString()
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getAxiosStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status
  return undefined
}

function getAxiosMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined
  const data = error.response?.data as { message?: string | string[] } | undefined
  if (Array.isArray(data?.message)) return data.message.join(', ')
  if (typeof data?.message === 'string') return data.message
  return error.message
}

function getLookupErrorMessage(error: unknown) {
  const status = getAxiosStatus(error)
  const message = getAxiosMessage(error)

  if (status === 400) {
    const lower = String(message || '').toLowerCase()
    if (lower.includes('street address') || lower.includes('house number')) {
      return 'Please select a specific address with a house number.'
    }
    return "Couldn't resolve this address. Please enter it manually."
  }
  if (status === 404) {
    return 'No ATTOM property record was found for this address. You can still fill the form manually.'
  }
  if (status === 502) {
    return 'Property search is unavailable right now. Please fill in manually.'
  }
  if (status === 500) {
    return 'Property lookup is not configured on the backend.'
  }
  return message || "Couldn't resolve this address. Please enter it manually."
}

/** Autocomplete only exposes main_text/description — approximate house-number check. */
function suggestionLooksLikeStreetAddress(suggestion: AddressSuggestion): boolean {
  const primary = (suggestion.main_text || suggestion.description || '').trim()
  return /^\d+[A-Za-z]?[\s-]/.test(primary)
}

function streetOnlyLabel(suggestion: AddressSuggestion): string {
  const main = (suggestion.main_text || '').trim()
  if (main && !main.includes(',')) return main
  // Fall back to first comma segment of description (never the full city/state/country line)
  const first = suggestion.description.split(',')[0]?.trim()
  return first || main || ''
}

function getSearchErrorMessage(error: unknown) {
  const status = getAxiosStatus(error)
  const message = getAxiosMessage(error)

  if (status === 401) return 'Your session expired. Please sign in again.'
  if (status === 429) return 'Too many address searches. Please wait a moment and try again.'
  if (status === 500) return 'Address search is not configured on the backend.'
  if (status === 502) {
    return 'Google address search is unavailable or the API key is not working.'
  }
  return message || 'Address search failed. You can still fill it manually.'
}

function PropertyLookupSummary({ result }: { result: PropertyLookupResult }) {
  const facts = [
    result.bedrooms !== null ? `${result.bedrooms} bed` : null,
    result.bathrooms !== null ? `${result.bathrooms} bath` : null,
    result.squareFootage !== null ? `${formatNumber(result.squareFootage)} sqft` : null,
    result.lotSizeAcres !== null ? `${result.lotSizeAcres} acres` : null,
  ].filter(Boolean)

  return (
    <div className="mt-4 rounded-xl border border-app1-primary/15 bg-app1-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-app1-primary text-white">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-poppins text-sm font-black text-app1-primary">Property data found</p>
          <p className="mt-1 font-poppins text-xs leading-5 text-app1-text-muted">
            ATTOM data prefilled address fields where available. Review city, state, and ZIP before
            continuing. Suggested market value is not the same as ARV.
          </p>
          {facts.length > 0 ? (
            <p className="mt-3 font-poppins text-sm font-bold text-app1-text-main">{facts.join(' · ')}</p>
          ) : null}
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div>
              <span className="font-poppins font-black uppercase tracking-[0.14em] text-app1-text-muted">
                Suggested market value
              </span>
              <p className="mt-1 font-poppins font-bold text-app1-text-main">
                {formatMoney(result.suggestedPrice)}
              </p>
            </div>
            <div>
              <span className="font-poppins font-black uppercase tracking-[0.14em] text-app1-text-muted">
                Last sale
              </span>
              <p className="mt-1 font-poppins font-bold text-app1-text-main">
                {result.lastSalePrice
                  ? `${formatMoney(result.lastSalePrice)}${
                      result.lastSaleDate ? ` on ${formatDate(result.lastSaleDate)}` : ''
                    }`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddressAutocomplete({
  propertyAddress,
  onPrefill,
  onAddressChange,
  disabled = false,
}: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [localSuggestions, setLocalSuggestions] = useState<AddressSuggestion[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertyLookupResult | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const sessionTokenRef = useRef(createSessionToken())
  const latestQueryRef = useRef('')
  const lastRequestedQueryRef = useRef('')
  const suppressSearchAfterSelectionRef = useRef(false)
  const searchCacheRef = useRef<Record<string, AddressSuggestion[]>>({})

  const trimmedAddress = propertyAddress.trim()
  const canSearch = !disabled && trimmedAddress.length >= MIN_ADDRESS_SEARCH_CHARS

  const visibleSuggestions = useMemo(() => {
    if (!canSearch || !isDropdownOpen) return []
    return localSuggestions
  }, [canSearch, isDropdownOpen, localSuggestions])

  function resetSessionToken() {
    sessionTokenRef.current = createSessionToken()
  }

  useEffect(() => {
    if (!isFocused || !canSearch) {
      setIsDropdownOpen(false)
      setLocalSuggestions([])
      return
    }

    if (suppressSearchAfterSelectionRef.current) {
      setIsDropdownOpen(false)
      setLocalSuggestions([])
      return
    }

    const currentQuery = trimmedAddress
    const normalizedQuery = currentQuery.toLowerCase()
    latestQueryRef.current = currentQuery

    const cachedResults = searchCacheRef.current[normalizedQuery]
    if (cachedResults) {
      setSearchError('')
      setLocalSuggestions(cachedResults)
      setIsDropdownOpen(true)
      return
    }

    if (lastRequestedQueryRef.current === normalizedQuery) return

    const timer = window.setTimeout(async () => {
      try {
        lastRequestedQueryRef.current = normalizedQuery
        setIsSearching(true)
        const results = await searchPropertyAddresses({
          query: currentQuery,
          session_token: sessionTokenRef.current,
        })
        if (latestQueryRef.current !== currentQuery) return
        searchCacheRef.current[normalizedQuery] = results
        setSearchError('')
        setLocalSuggestions(results)
        setIsDropdownOpen(true)
      } catch (error: unknown) {
        if (latestQueryRef.current !== currentQuery) return
        setSearchError(getSearchErrorMessage(error))
        setLocalSuggestions([])
        setIsDropdownOpen(true)
      } finally {
        setIsSearching(false)
      }
    }, ADDRESS_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [canSearch, isFocused, trimmedAddress])

  async function handleSelectSuggestion(suggestion: AddressSuggestion) {
    setLookupError('')
    setSearchError('')
    setIsDropdownOpen(false)
    setLocalSuggestions([])
    setSelectedProperty(null)
    suppressSearchAfterSelectionRef.current = true

    const streetOnly = streetOnlyLabel(suggestion)
    latestQueryRef.current = streetOnly
    lastRequestedQueryRef.current = streetOnly.toLowerCase()

    // Clear previous city/state/zip immediately so a failed/slow select cannot
    // leave a prior pick's state (e.g. DC) on a new address.
    onPrefill({
      propertyAddress: streetOnly,
      city: '',
      stateCode: '',
      zipCode: '',
    })

    if (!suggestionLooksLikeStreetAddress(suggestion)) {
      setLookupError('Please select a specific address with a house number.')
      onAddressChange('')
      onPrefill({
        propertyAddress: '',
        city: '',
        stateCode: '',
        zipCode: '',
      })
      resetSessionToken()
      return
    }

    try {
      setIsSelecting(true)
      const result = await selectPropertyAddress({
        place_id: suggestion.place_id,
        session_token: sessionTokenRef.current,
      })

      const resolvedStreet =
        (result.propertyAddress || '').trim() || streetOnly

      onPrefill({
        propertyAddress: resolvedStreet,
        city: (result.city || '').trim(),
        stateCode: (result.stateCode || '').trim().toUpperCase(),
        zipCode: (result.zipCode || '').trim(),
      })
      setSelectedProperty(result)
      resetSessionToken()
    } catch (error: unknown) {
      // Don't leave a stuck partial street — force manual entry.
      onAddressChange('')
      onPrefill({
        propertyAddress: '',
        city: '',
        stateCode: '',
        zipCode: '',
      })
      setLookupError(getLookupErrorMessage(error))
      resetSessionToken()
    } finally {
      setIsSelecting(false)
    }
  }

  function handleManualAddressChange(value: string) {
    suppressSearchAfterSelectionRef.current = false
    setLookupError('')
    setSearchError('')
    setSelectedProperty(null)
    onAddressChange(value)

    if (!value.trim()) {
      resetSessionToken()
      setIsDropdownOpen(false)
      setLocalSuggestions([])
      lastRequestedQueryRef.current = ''
      latestQueryRef.current = ''
      return
    }

    if (value.trim().length < MIN_ADDRESS_SEARCH_CHARS) {
      setIsDropdownOpen(false)
      setLocalSuggestions([])
    }
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false)
          setIsDropdownOpen(false)
        }
      }}
    >
      <div className="relative">
        <input
          id="property-address"
          type="text"
          value={propertyAddress}
          disabled={disabled}
          onFocus={() => {
            if (disabled) return
            setIsFocused(true)
            if (canSearch) setIsDropdownOpen(true)
          }}
          onChange={(event) => handleManualAddressChange(event.target.value)}
          placeholder="Start typing address, e.g. 4821 Maple Drive"
          className={cn(
            'w-full rounded-[8px] border border-app1-border-light bg-app1-bg-soft px-4 py-3 pr-11 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-1 focus:ring-app1-secondary',
            disabled && 'cursor-not-allowed opacity-70',
          )}
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-app1-text-muted">
          {isSearching || isSelecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>
      </div>

      {lookupError ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 font-poppins text-xs font-semibold leading-5 text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{lookupError}</span>
        </div>
      ) : null}

      {isSelecting ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-app1-primary/15 bg-app1-primary/5 p-3 font-poppins text-xs font-bold text-app1-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching property details from ATTOM...
        </div>
      ) : null}

      {isDropdownOpen && canSearch ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-app1-border-light bg-white shadow-xl">
          {isSearching ? (
            <div className="flex items-center gap-2 px-4 py-3 font-poppins text-sm font-semibold text-app1-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching addresses...
            </div>
          ) : null}

          {!isSearching && searchError ? (
            <div className="px-4 py-3 font-poppins text-sm font-semibold text-red-600">{searchError}</div>
          ) : null}

          {!isSearching && !searchError && visibleSuggestions.length === 0 ? (
            <div className="px-4 py-3 font-poppins text-sm font-semibold text-app1-text-muted">
              No address suggestions found.
            </div>
          ) : null}

          {!isSearching &&
            !searchError &&
            visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void handleSelectSuggestion(suggestion)}
                className="flex w-full items-start gap-3 border-b border-app1-border-light px-4 py-3 text-left transition last:border-b-0 hover:bg-app1-primary/5"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app1-bg-soft text-app1-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-poppins text-sm font-black text-app1-text-main">
                    {suggestion.main_text || suggestion.description}
                  </p>
                  {suggestion.secondary_text ? (
                    <p className="mt-0.5 truncate font-poppins text-xs font-semibold text-app1-text-muted">
                      {suggestion.secondary_text}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
        </div>
      ) : null}

      {!selectedProperty && !disabled ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-app1-bg-soft p-3 font-poppins text-xs leading-5 text-app1-text-muted">
          <Home className="mt-0.5 h-4 w-4 shrink-0 text-app1-primary" />
          <p>
            Select a suggested address to auto-fill street, city, state, and ZIP from Google + ATTOM.
            You can still edit everything manually.
          </p>
        </div>
      ) : null}

      {selectedProperty ? <PropertyLookupSummary result={selectedProperty} /> : null}
    </div>
  )
}
