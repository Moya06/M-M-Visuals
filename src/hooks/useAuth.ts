import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

const MASTER_USER = 'fabianmoya353'
const MASTER_PASS = 'Chimue_Oli-458901'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem('local_admin_session')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('local_admin_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si ya tenemos sesión maestra local
    if (localStorage.getItem('local_admin_session')) {
      setLoading(false)
      return
    }

    // Comprobar Supabase si está configurado
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session)
          setUser(session.user)
        }
        setLoading(false)
      }).catch(() => setLoading(false))

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setSession(session)
          setUser(session.user)
        }
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch {
      setLoading(false)
    }
  }, [])

  const signIn = async (identifier: string, pass: string) => {
    // 1. Verificación directa de las credenciales maestras
    const cleanId = identifier.trim().toLowerCase()
    if ((cleanId === MASTER_USER.toLowerCase() || cleanId === `${MASTER_USER.toLowerCase()}@admin.local`) && pass === MASTER_PASS) {
      const mockUser = {
        id: 'master-admin-fabian',
        email: `${MASTER_USER}@admin.local`,
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: { name: 'Fabián Moya' },
        created_at: new Date().toISOString(),
      } as unknown as User

      const mockSession = {
        access_token: 'master-token-session',
        token_type: 'bearer',
        user: mockUser,
      } as unknown as Session

      localStorage.setItem('local_admin_session', JSON.stringify(mockSession))
      localStorage.setItem('local_admin_user', JSON.stringify(mockUser))
      setSession(mockSession)
      setUser(mockUser)
      return { error: null }
    }

    // 2. Si no es la clave maestra, intentar autenticar con Supabase si está activo
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: identifier, password: pass })
      return { error }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('local_admin_session')
    localStorage.removeItem('local_admin_user')
    setSession(null)
    setUser(null)
    try {
      await supabase.auth.signOut()
    } catch {
      // Ignorar si supabase no responde
    }
  }

  return { session, user, loading, signIn, signOut }
}
