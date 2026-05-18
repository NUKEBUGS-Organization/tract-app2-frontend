/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'jumio-sdk': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { dc?: string; token?: string },
        HTMLElement
      >
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_PLACEHOLDER_PROPERTY_IMAGE?: string
  readonly VITE_PLACEHOLDER_AVATAR_IMAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
