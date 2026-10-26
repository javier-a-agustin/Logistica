import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '@/lib/constants'
import { ForbiddenPage } from '@/features/errors/ForbiddenPage'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  // Sin roles: alcanza con estar autenticado
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { session, hasRole } = useAuth()
  const location = useLocation()

  if (!session) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !hasRole(...roles)) return <ForbiddenPage />

  return <Outlet />
}
