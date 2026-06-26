import { createContext, useContext } from 'react'

type SidebarContextValue = {
  close: () => void
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarClose() {
  return useContext(SidebarContext)?.close ?? (() => {})
}
