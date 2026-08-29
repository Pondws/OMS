import { authApi } from 'apis'
import { persist } from 'zustand/middleware'
import { create } from 'zustand'

type User = { id: string; email: string };

interface AuthStore {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
  login: (email: string, password: string) => Promise<void>
  fetchMe: () => void
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      login: async (email, password) => {
        await authApi.login({ email, password })
        const res = await authApi.getMe()
        set({ user: res })
        set({ isAuthenticated: true })
      },
      fetchMe: async () => {
        try {
          const user = await authApi.getMe()
          set({ user, loading: false })
        } catch {
          set({ user: null, loading: false })
          set({ isAuthenticated: false })
        }
      },
      logout: () => {
        authApi.logout()
        set({ user: null })
        set({ isAuthenticated: false })
      }
    }),
    {
      name: 'auth',
    }
  )
)