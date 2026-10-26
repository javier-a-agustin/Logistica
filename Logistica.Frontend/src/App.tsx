import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { isApiError } from './api/client'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './features/auth/LoginPage'
import { CatalogosPage } from './features/catalogos/CatalogosPage'
import { ChoferesPage } from './features/choferes/ChoferesPage'
import { ClientesPage } from './features/clientes/ClientesPage'
import { NotFoundPage } from './features/errors/NotFoundPage'
import { PaquetesPage } from './features/paquetes/PaquetesPage'
import { RecepcionPage } from './features/recepcion/RecepcionPage'
import { SeguimientoPage } from './features/seguimiento/SeguimientoPage'
import { UsuariosPage } from './features/usuarios/UsuariosPage'
import { VehiculosPage } from './features/vehiculos/VehiculosPage'
import { DespachoPage } from './features/viajes/DespachoPage'
import { HojaRutaPage } from './features/viajes/HojaRutaPage'
import { MiHojaRutaPage } from './features/viajes/MiHojaRutaPage'
import { MisViajesPage } from './features/viajes/MisViajesPage'
import { ViajesPage } from './features/viajes/ViajesPage'
import { homeByRole, rolesFor } from './lib/navigation'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Los 4xx (no encontrado, sin permisos, etc.) no se reintentan
      retry: (failureCount, error) =>
        !(isApiError(error) && error.status >= 400 && error.status < 500) && failureCount < 2,
    },
  },
})

function HomeRedirect() {
  const { session } = useAuth()
  return <Navigate to={session ? homeByRole[session.rol] : '/login'} replace />
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          { path: 'seguimiento/:codigo?', element: <SeguimientoPage /> },
          {
            element: <ProtectedRoute roles={rolesFor('/recepcion')} />,
            children: [{ path: 'recepcion', element: <RecepcionPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/paquetes')} />,
            children: [{ path: 'paquetes', element: <PaquetesPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/clientes')} />,
            children: [{ path: 'clientes', element: <ClientesPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/despacho')} />,
            children: [{ path: 'despacho', element: <DespachoPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/viajes')} />,
            children: [
              { path: 'viajes', element: <ViajesPage /> },
              { path: 'viajes/:id', element: <HojaRutaPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/mis-viajes')} />,
            children: [
              { path: 'mis-viajes', element: <MisViajesPage /> },
              { path: 'mis-viajes/:id', element: <MiHojaRutaPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/vehiculos')} />,
            children: [{ path: 'vehiculos', element: <VehiculosPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/choferes')} />,
            children: [{ path: 'choferes', element: <ChoferesPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/usuarios')} />,
            children: [{ path: 'usuarios', element: <UsuariosPage /> }],
          },
          {
            element: <ProtectedRoute roles={rolesFor('/catalogos')} />,
            children: [{ path: 'catalogos', element: <CatalogosPage /> }],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
