import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  proMode: boolean
  sidebarOpen: boolean
  toggleProMode: () => void
  setSidebarOpen: (v: boolean) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      proMode: false,
      sidebarOpen: true,
      toggleProMode: () => set((s) => ({ proMode: !s.proMode })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'tract-ui' }
  )
)
