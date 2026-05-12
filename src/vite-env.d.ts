/// <reference types="vite/client" />

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
