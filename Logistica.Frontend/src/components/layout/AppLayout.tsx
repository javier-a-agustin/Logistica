import { useState } from 'react'
import { Outlet } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { Icon } from './Icon'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const { session } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-dvh lg:pl-60 print:pl-0">
      {/* Escritorio: barra lateral fija */}
      <Sidebar className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:flex print:hidden" />

      {/* Celular / tablet: menú desplegable */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden print:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={closeMenu} aria-hidden="true" />
          <Sidebar className="relative h-full w-72 max-w-[85vw] shadow-xl" onNavigate={closeMenu} />
        </div>
      )}

      {/* Barra superior (solo pantallas chicas) */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="-ml-2 rounded-md p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          <Icon name="menu" className="size-6" />
        </button>
        <span className="font-semibold text-brand-800">Logística</span>
        {session && (
          <span className="ml-auto truncate text-right text-xs text-slate-500">
            {session.nombreUsuario} · {session.rol}
          </span>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">
        <Outlet />
      </main>
    </div>
  )
}
