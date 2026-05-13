import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  signUp: (email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  init: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  init: async () => {
    if (!isSupabaseConfigured()) {
      set({ initialized: true })
      return
    }
    const { data } = await supabase.auth.getSession()
    set({ session: data.session, user: data.session?.user ?? null, initialized: true })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signUp: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ loading: false })
    if (error) return error.message
    return null
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    if (error) return error.message
    set({ session: data.session, user: data.user })
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
