import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import type { Rol } from '@/lib/constants'
import type { LoginDTO } from '@/types'
import { AuthContext, type AuthContextValue } from './context'
import { sessionStore } from './session'

// setTimeout no admite más de ~24,8 días
const MAX_TIMEOUT = 2_147_483_647

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.get)
  const queryClient = useQueryClient()

  // Logout automático cuando vence el token
  useEffect(() => {
    if (!session) return
    const ms = new Date(session.expira).getTime() - Date.now()
    if (ms <= 0) {
      sessionStore.clear('expired')
      return
    }
    const timer = setTimeout(() => sessionStore.clear('expired'), Math.min(ms, MAX_TIMEOUT))
    return () => clearTimeout(timer)
  }, [session])

  // Sin sesión no debe quedar en caché información del usuario anterior
  useEffect(() => {
    if (!session) queryClient.clear()
  }, [session, queryClient])

  useEffect(() => {
    const onStorage = () => sessionStore.syncFromStorage()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Verifica una vez que el token guardado siga siendo aceptado por el servidor (un 401 cierra la sesión)
  useQuery({
    queryKey: ['auth', 'me', session?.token],
    queryFn: authApi.me,
    enabled: !!session,
    staleTime: Infinity,
    retry: false,
  })

  const login = useCallback(async (credenciales: LoginDTO) => {
    const respuesta = await authApi.login(credenciales)
    sessionStore.set(respuesta)
    return respuesta
  }, [])

  const logout = useCallback(() => sessionStore.clear('manual'), [])

  const hasRole = useCallback((...roles: Rol[]) => !!session && roles.includes(session.rol), [session])

  const value = useMemo<AuthContextValue>(
    () => ({ session, login, logout, hasRole }),
    [session, login, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
