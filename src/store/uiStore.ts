import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  proMode: boolean
  toggleProMode: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      proMode: false,
      toggleProMode: () => {
        const next = !get().proMode
        set({ proMode: next })
        if (next) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }),
    {
      name: 'tract-ui',
      onRehydrateStorage: () => (state) => {
        if (state?.proMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    },
  ),
)
