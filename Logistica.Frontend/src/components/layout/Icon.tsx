import type { IconName } from '@/lib/navigation'

// Trazos estilo "outline" de 24x24
const paths: Record<IconName | 'menu' | 'logout', string> = {
  search: 'm21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z',
  inbox: 'M3 13.5h4.5l1.5 3h6l1.5-3H21M3 13.5 5.25 5h13.5L21 13.5M3 13.5V19h18v-5.5',
  package: 'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  users: 'M15 19.5a6 6 0 0 0-12 0M9 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM21 19.5a5.25 5.25 0 0 0-4.5-5.2M15.75 3.9a3.75 3.75 0 0 1 0 7.2',
  route: 'M6 19.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM18 9a2.25 2.25 0 1 0 0-4.5A2.25 2.25 0 0 0 18 9ZM8.25 17.25h7.5a3.375 3.375 0 0 0 0-6.75h-7.5a3.375 3.375 0 0 1 0-6.75h7.5',
  map: 'M9 6.75V15m6-6v8.25M3 6.75 9 4.5l6 2.25 6-2.25v12.75l-6 2.25-6-2.25-6 2.25V6.75Z',
  truck: 'M3 6h11.25v10.5H3V6Zm11.25 3.75h3.75l3 3v3.75h-6.75M7.5 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  id: 'M3.75 5.25h16.5v13.5H3.75V5.25ZM8.25 12a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm-3 4.5a3 3 0 0 1 6 0M13.5 9h4.5m-4.5 3h4.5m-4.5 3h3',
  shield: 'M12 3 4.5 6v5.25c0 4.5 3.2 8.25 7.5 9.75 4.3-1.5 7.5-5.25 7.5-9.75V6L12 3Zm-3 9 2.25 2.25L15 10.5',
  tag: 'M9.57 3H4.5A1.5 1.5 0 0 0 3 4.5v5.07c0 .4.16.78.44 1.06l9.69 9.69a1.5 1.5 0 0 0 2.12 0l4.94-4.94a1.5 1.5 0 0 0 0-2.12l-9.69-9.69A1.5 1.5 0 0 0 9.57 3ZM7.5 7.5h.01',
  menu: 'M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5',
  logout: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 12h9m0 0-3-3m3 3-3 3',
}

export function Icon({ name, className = 'size-5' }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  )
}
