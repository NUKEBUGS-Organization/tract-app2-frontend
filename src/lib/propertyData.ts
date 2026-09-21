import api from '@/lib/api'

export type AddressSuggestion = {
  place_id: string
  description: string
  main_text: string | null
  secondary_text: string | null
}

/**
 * Google Places is the only property-data provider: it resolves addresses and
 * returns nothing about the parcel itself. Beds, baths, square footage, year
 * built and price are entered by hand on the listing form.
 */
export type PropertyLookupResult = {
  propertyAddress: string
  city: string | null
  stateCode: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  formattedAddress: string
  /** False when Places resolved a street without a house number. */
  streetAddressComplete: boolean
  source: 'google'
}

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
  message?: string
}

function unwrap<T>(body: ApiEnvelope<T> | T): T {
  if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
    return body.data as T
  }
  return body as T
}

/** Resolves a full typed address through Places; the typeahead step is not required. */
export async function lookupPropertyAddress(address1: string, address2: string): Promise<PropertyLookupResult> {
  const { data } = await api.get<ApiEnvelope<PropertyLookupResult> | PropertyLookupResult>(
    '/property-data/lookup', { params: { address1, address2 } },
  )
  return unwrap(data)
}

export async function searchPropertyAddresses(params: {
  query: string
  session_token?: string
}): Promise<AddressSuggestion[]> {
  const { data } = await api.get<ApiEnvelope<AddressSuggestion[]> | AddressSuggestion[]>(
    '/property-data/search',
    {
      params: {
        query: params.query,
        ...(params.session_token ? { session_token: params.session_token } : {}),
      },
    },
  )
  const payload = unwrap(data)
  return Array.isArray(payload) ? payload : []
}

export async function selectPropertyAddress(params: {
  place_id: string
  selected_street?: string
  session_token?: string
}): Promise<PropertyLookupResult> {
  const { data } = await api.get<ApiEnvelope<PropertyLookupResult> | PropertyLookupResult>(
    '/property-data/select',
    {
      params: {
        place_id: params.place_id,
        ...(params.selected_street ? { selected_street: params.selected_street } : {}),
        ...(params.session_token ? { session_token: params.session_token } : {}),
      },
    },
  )
  return unwrap(data)
}
