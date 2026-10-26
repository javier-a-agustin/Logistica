import { NavLink } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { cn } from '@/lib/cn'
import { sectionsFor } from '@/lib/navigation'
import { Icon } from './Icon'

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { session, logout } = useAuth()
  if (!session) return null
  const sections = sectionsFor(session.rol)

  return (
    <aside className={cn('flex flex-col bg-brand-800 text-brand-100', className)}>
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-white/10 text-white">
          <Icon name="truck" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Logística</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Secciones">
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.to}>
              <NavLink
                to={section.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon name={section.icon} />
                {section.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white uppercase">
            {session.nombreUsuario.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{session.nombreUsuario}</p>
            <p className="truncate text-xs text-brand-200">{session.rol}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className="rounded-md p-2 text-brand-100 hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" />
            <span className="sr-only">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
