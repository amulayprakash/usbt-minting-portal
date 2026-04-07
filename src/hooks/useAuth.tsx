import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  usbtBalance: number
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usbtBalance, setUsbtBalance] = useState(0)

  const fetchBalance = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('usbt_balance')
      .eq('id', userId)
      .single()
    if (data) setUsbtBalance(Number(data.usbt_balance))
  }, [])

  const refreshBalance = useCallback(async () => {
    if (user) await fetchBalance(user.id)
  }, [user, fetchBalance])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchBalance(session.user.id)
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchBalance(session.user.id)
      else setUsbtBalance(0)
    })

    return () => subscription.unsubscribe()
  }, [fetchBalance])

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, usbtBalance, signInWithGoogle, signOut, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
