import { EstadoPaqueteBadge } from '@/components/EstadoBadge'
import { EstadosPaquete } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import type { HistorialPaqueteDTO } from '@/types'

const dotColor: Record<number, string> = {
  [EstadosPaquete.EnDeposito]: 'bg-sky-500',
  [EstadosPaquete.EnTransito]: 'bg-amber-500',
  [EstadosPaquete.Entregado]: 'bg-emerald-500',
  [EstadosPaquete.Cancelado]: 'bg-red-500',
}

// Historial del paquete, del movimiento más reciente al más antiguo
export function HistorialTimeline({ historial }: { historial: HistorialPaqueteDTO[] }) {
  const items = [...historial].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())

  if (items.length === 0) return <p className="text-sm text-slate-500">Sin movimientos registrados.</p>

  return (
    <ol className="relative">
      {items.map((item, i) => (
        <li key={item.idHistorial} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && <span className="absolute top-4 left-[7px] h-full w-0.5 bg-slate-200" aria-hidden="true" />}
          <span
            className={cn(
              'relative mt-1 size-4 shrink-0 rounded-full ring-4 ring-white',
              dotColor[item.idEstadoPaquete] ?? 'bg-slate-400',
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <EstadoPaqueteBadge id={item.idEstadoPaquete} nombre={item.estado} />
              <time className="text-sm text-slate-500" dateTime={item.fechaHora}>
                {formatDateTime(item.fechaHora)}
              </time>
              {i === 0 && <span className="text-xs font-medium text-brand-600">Último movimiento</span>}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Registrado por <span className="font-medium text-slate-800">{item.usuario}</span>
            </p>
            {item.observacion && (
              <p className="mt-1 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700 italic">“{item.observacion}”</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
