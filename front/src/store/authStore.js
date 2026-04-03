import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      checkTokenValid: () => {
        const { token } = get()
        if (!token) return false
        try {
          const decoded = jwtDecode(token)
          return decoded.exp * 1000 > Date.now()
        } catch {
          return false
        }
      },

      getRole: () => get().user?.role || null,
    }),
    {
      name: 'lms-auth',
    }
  )
)

export default useAuthStore
