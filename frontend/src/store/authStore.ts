import { create } from 'zustand'
import type { User } from '../types'
import { authAPI } from '../services/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('pheobus_token'),
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('pheobus_token', data.access_token)
    set({ user: data.user, token: data.access_token, isAuthenticated: true })
  },

  register: async (userData) => {
    const { data } = await authAPI.register(userData)
    localStorage.setItem('pheobus_token', data.access_token)
    set({ user: data.user, token: data.access_token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('pheobus_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadUser: async () => {
    const token = localStorage.getItem('pheobus_token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    try {
      const { data } = await authAPI.me()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('pheobus_token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
