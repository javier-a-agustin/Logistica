import { Roles, type Rol } from './constants'

export type IconName =
  | 'search'
  | 'inbox'
  | 'package'
  | 'users'
  | 'route'
  | 'map'
  | 'truck'
  | 'id'
  | 'shield'
  | 'tag'

export interface NavSection {
  to: string
  label: string
  icon: IconName
  roles: readonly Rol[]
}

const { Recepcionista, Despachante, Chofer, Gerente } = Roles
const TODOS = [Recepcionista, Despachante, Chofer, Gerente] as const

// Única fuente de verdad de qué rol ve cada pantalla (sidebar + rutas). Refleja los [Authorize] del backend
export const navSections = [
  { to: '/recepcion', label: 'Recepción', icon: 'inbox', roles: [Recepcionista, Gerente] },
  { to: '/despacho', label: 'Despacho', icon: 'route', roles: [Despachante, Gerente] },
  { to: '/mis-viajes', label: 'Mis viajes', icon: 'map', roles: [Chofer] },
  { to: '/paquetes', label: 'Paquetes', icon: 'package', roles: [Recepcionista, Despachante, Gerente] },
  { to: '/viajes', label: 'Viajes', icon: 'map', roles: [Despachante, Gerente] },
  { to: '/clientes', label: 'Clientes', icon: 'users', roles: [Recepcionista, Despachante, Gerente] },
  { to: '/seguimiento', label: 'Seguimiento', icon: 'search', roles: TODOS },
  { to: '/vehiculos', label: 'Vehículos', icon: 'truck', roles: [Despachante, Gerente] },
  { to: '/choferes', label: 'Choferes', icon: 'id', roles: [Despachante, Gerente] },
  { to: '/usuarios', label: 'Usuarios', icon: 'shield', roles: [Gerente] },
  { to: '/catalogos', label: 'Catálogos', icon: 'tag', roles: [Gerente] },
] as const satisfies readonly NavSection[]

export type SectionPath = (typeof navSections)[number]['to']

export function rolesFor(path: SectionPath): Rol[] {
  return [...(navSections.find((section) => section.to === path)?.roles ?? [])]
}

export function sectionsFor(rol: Rol): NavSection[] {
  return navSections.filter((section) => (section.roles as readonly Rol[]).includes(rol))
}

export function canAccess(pathname: string, rol: Rol): boolean {
  const section = navSections.find((s) => pathname === s.to || pathname.startsWith(`${s.to}/`))
  return !section || (section.roles as readonly Rol[]).includes(rol)
}

// Pantalla inicial de cada rol después del login
export const homeByRole: Record<Rol, string> = {
  [Recepcionista]: '/recepcion',
  [Despachante]: '/despacho',
  [Chofer]: '/mis-viajes',
  [Gerente]: '/paquetes',
}
