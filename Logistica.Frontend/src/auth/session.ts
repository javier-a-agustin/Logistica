import type { LoginRespuestaDTO } from '@/types'

export type Session = LoginRespuestaDTO
export type LogoutReason = 'manual' | 'expired' | 'unauthorized'

const STORAGE_KEY = 'logistica.session'

export function isExpired(session: Session): boolean {
  return new Date(session.expira).getTime() <= Date.now()
}

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    if (!session.token || isExpired(session)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

let current: Session | null = read()
let lastLogoutReason: LogoutReason | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

// Store externo (useSyncExternalStore) para que el cliente HTTP pueda leer el token y cerrar la sesión ante un 401
export const sessionStore = {
  get: () => current,

  getToken: () => (current && !isExpired(current) ? current.token : null),

  set(session: Session) {
    current = session
    lastLogoutReason = null
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    emit()
  },

  clear(reason: LogoutReason = 'manual') {
    if (!current) return
    current = null
    lastLogoutReason = reason
    localStorage.removeItem(STORAGE_KEY)
    emit()
  },

  // Motivo del último cierre de sesión (para avisar en la pantalla de login). Se limpia al volver a ingresar
  getLogoutReason: (): LogoutReason | null => lastLogoutReason,

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  // Sincroniza login/logout hechos en otra pestaña
  syncFromStorage() {
    const next = read()
    if (next?.token === current?.token) return
    current = next
    emit()
  },
}
