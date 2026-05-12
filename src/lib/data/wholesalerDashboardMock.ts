/** Fallback when GET /wholesaler/dashboard is unavailable (dev / offline). */
export interface WholesalerDashboardDeal {
  id: string
  propertyLine: string
  portfolioRef: string
  imageUrl: string
  status: 'under_contract' | 'action_required'
  stepLabel: string
  timerLabel: string
  timerTone: 'green' | 'red'
  timerPulse?: boolean
  primaryAction: 'view' | 'upload'
}

export interface WholesalerDashboardListing {
  id: string
  address: string
  imageUrl: string
  badge: string
  arv: number
  startingBid: number
  viewsLabel: string
  timeLeftLabel: string
}

export interface WholesalerDashboardPayload {
  stats: {
    activeDeals: number
    myListings: number
    reliabilityScore: number
    reliabilityTier: string
    killSwitchAlerts: number
  }
  killSwitch: {
    dealId: string
    headline: string
    detailLine: string
    timerLabel: string
  } | null
  pipeline: WholesalerDashboardDeal[]
  listings: WholesalerDashboardListing[]
}

export const WHOLESALER_DASHBOARD_MOCK: WholesalerDashboardPayload = {
  stats: {
    activeDeals: 2,
    myListings: 5,
    reliabilityScore: 91,
    reliabilityTier: 'Elite',
    killSwitchAlerts: 1,
  },
  killSwitch: {
    dealId: 'A047',
    headline: 'Action Required',
    detailLine: 'Proof of Funds Expiring',
    timerLabel: '11h 23m',
  },
  pipeline: [
    {
      id: '9921',
      propertyLine: '4821 Maple Dr, Austin TX',
      portfolioRef: 'Portfolio #9921',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCj4bakLSWwH4fbHltwEVarNARyewbnoG_oObQsSu89p82uRWufQoV3sJCZK6aa8RtLUo-U0HmMk-mdADZ3ZZ-VfD4_OZOFYdhDt_TwzSuJW5oAhJeGylPGA6_jehMnIjPSqoSDAEw6kpiSux1iQzuXY2hQXbD6-nclqx13cfYya-VhkvYRJbFK2_sl3oN9ddXoTvTYBO6KXavKOrhEkUOlDFz3nkMinMxH9j4Qg-VIhXyUSONZ6GKRgYOhm_VUSUFJbkVwBXCxmVQ',
      status: 'under_contract',
      stepLabel: 'Inspection Phase',
      timerLabel: '47h remaining',
      timerTone: 'green',
      primaryAction: 'view',
    },
    {
      id: 'A047',
      propertyLine: '902 River Bend, Dallas TX',
      portfolioRef: 'Portfolio #A047',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAb3EVEPwF0ZDWOExZ4ea_RNTdHjpoYgLn1jI0oJrGCl72hOFAwEoTuPJknkkW0oeAzsenyubKzDZNXOqWJsL1OTYC2axfiFAsr_ICQ698eBQldlIjw5hk_MLMN2WbxbTnxXuq92FUtPS5EkG2WATRZ7d2W1YFAt1AggNJJ_yvpAd5ykSl3JYKQkERyUNruGOeRw1tG862jaDazp7FDqPHacPJQXFO2C3uRhxBifQ1443wn-ZEcm5I_glV0E1RSV8NPcw5HlAcb1lk',
      status: 'action_required',
      stepLabel: 'Marketing Proof',
      timerLabel: '11h 23m',
      timerTone: 'red',
      timerPulse: true,
      primaryAction: 'upload',
    },
  ],
  listings: [
    {
      id: '1',
      address: '221B Baker St, Houston TX',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD1t5UhZMcEA7CVk1ZKxMvJUqsvYC-4hYO0R6b0fKcX3f7JPFYV_keJogDuGhfxuyNGrxVERuyarhAVw-6iF6ZzQuiSPs1lYQpkrwqrUAf6a5xo0FqIlkTWxXRFDUGdKWgGGtJbPxiQHbKb5TLjQQFxRQk4f9HmMkHS_Njf9UJ6kcng2zJD-9Vbfo4hS_9L6Bon7YlkpsmNl5cJQMJACwqvbWaxtDRDPRnteQVSXkMVnx40NfEJwJFM8xpygHy3t6ZWbPgKV3Q-3oQ',
      badge: 'Live • 4 Bids',
      arv: 425_000,
      startingBid: 310_000,
      viewsLabel: '1.2k Views',
      timeLeftLabel: '2d Left',
    },
    {
      id: '2',
      address: '742 Evergreen Terr, San Antonio',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDN3xWVyf6N9G0ppwrf-B1tOXHK_2dYJJwA2IZ62vhFJdsGpgrcH4iCdw5CfUxTurYmvMSpgKzRtlRbACx9WeqARTr6Oea22_sXze1RxTlXiU7INYlMn6zN8VphE9p4eSPxTRA86p301aSgrgsUrHfbtv442yi2yFTc_swiHsmKtywN3Xt8w3bY5eqNZ3tZmEGGx7gb2Cx7mhLebLp4-wu4agesq9eHq-Ifd-xPBVv5SAVzaA_QTyvCp4r9__iONgrkrWvc3YTUVcE',
      badge: 'Live • 12 Bids',
      arv: 280_000,
      startingBid: 195_000,
      viewsLabel: '4.5k Views',
      timeLeftLabel: '6h Left',
    },
  ],
}
