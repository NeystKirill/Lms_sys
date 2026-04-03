import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        document.documentElement.setAttribute('data-theme', next)
      },
      init: () => {
        const theme = get().theme
        document.documentElement.setAttribute('data-theme', theme)
      },
    }),
    { name: 'lms-theme' }
  )
)

export default useThemeStore
