import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types'

interface RegisterState {
  role: UserRole | null
  fullName: string
  email: string
  phone: string
  password: string
  stateCode: string
  dob: string
  termsAccepted: boolean
  setRole: (role: UserRole) => void
  setStep2Data: (
    data: Partial<Pick<RegisterState, 'fullName' | 'email' | 'phone' | 'password' | 'stateCode' | 'dob'>>,
  ) => void
  setTermsAccepted: (v: boolean) => void
  reset: () => void
}

export const useRegisterStore = create<RegisterState>()(
  persist(
    (set) => ({
      role: null,
      fullName: '',
      email: '',
      phone: '',
      password: '',
      stateCode: '',
      dob: '',
      termsAccepted: false,
      setRole: (role) => set({ role }),
      setStep2Data: (data) => set(data),
      setTermsAccepted: (termsAccepted) => set({ termsAccepted }),
      reset: () =>
        set({
          role: null,
          fullName: '',
          email: '',
          phone: '',
          password: '',
          stateCode: '',
          dob: '',
          termsAccepted: false,
        }),
    }),
    {
      name: 'tract-register',
      partialize: (s) => ({
        role: s.role,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        password: s.password,
        stateCode: s.stateCode,
        dob: s.dob,
        termsAccepted: s.termsAccepted,
      }),
    },
  ),
)
