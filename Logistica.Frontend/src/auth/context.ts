import { createContext } from 'react'
import type { Rol } from '@/lib/constants'
import type { LoginDTO } from '@/types'
import type { Session } from './session'

export interface AuthContextValue {
  session: Session | null
  login: (credenciales: LoginDTO) => Promise<Session>
  logout: () => void
  hasRole: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
