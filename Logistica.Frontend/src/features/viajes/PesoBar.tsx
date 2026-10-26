import { cn } from '@/lib/cn'
import { formatKg } from '@/lib/format'

interface PesoBarProps {
  pesoKg: number
  // Sin vehículo elegido solo se muestra el total
  capacidadKg?: number
  className?: string
}

// Regla de negocio: SUM(Paquete.PesoKg) <= Vehiculo.CapacidadKg
export function PesoBar({ pesoKg, capacidadKg, className }: PesoBarProps) {
  if (!capacidadKg) {
    return (
      <div className={cn('text-sm text-slate-600', className)}>
        Peso total: <span className="font-semibold text-slate-900">{formatKg(pesoKg)}</span>
        <span className="text-slate-400"> · elegí un vehículo para ver la capacidad</span>
      </div>
    )
  }

  const porcentaje = (pesoKg / capacidadKg) * 100
  const excedido = pesoKg > capacidadKg
  const color = excedido ? 'bg-red-500' : porcentaje >= 85 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-slate-600">
          <span className={cn('font-semibold', excedido ? 'text-red-600' : 'text-slate-900')}>{formatKg(pesoKg)}</span> de{' '}
          {formatKg(capacidadKg)}
        </span>
        <span className={cn('font-medium tabular-nums', excedido ? 'text-red-600' : 'text-slate-500')}>{Math.round(porcentaje)}%</span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-200"
        role="meter"
        aria-label="Carga del vehículo"
        aria-valuemin={0}
        aria-valuemax={capacidadKg}
        aria-valuenow={pesoKg}
      >
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(porcentaje, 100)}%` }} />
      </div>
      {excedido && (
        <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">
          Se supera la capacidad del vehículo por {formatKg(pesoKg - capacidadKg)}.
        </p>
      )}
    </div>
  )
}
