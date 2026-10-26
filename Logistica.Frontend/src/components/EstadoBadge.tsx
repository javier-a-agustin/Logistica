import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { EstadosPaquete, EstadosViaje, nombreEstadoPaquete, nombreEstadoViaje } from '@/lib/constants'

const tonoPaquete: Record<number, BadgeTone> = {
  [EstadosPaquete.EnDeposito]: 'blue',
  [EstadosPaquete.EnTransito]: 'amber',
  [EstadosPaquete.Entregado]: 'green',
  [EstadosPaquete.Cancelado]: 'red',
}

const tonoViaje: Record<number, BadgeTone> = {
  [EstadosViaje.Programado]: 'violet',
  [EstadosViaje.EnCurso]: 'amber',
  [EstadosViaje.Finalizado]: 'green',
  [EstadosViaje.Cancelado]: 'red',
}

interface EstadoBadgeProps {
  id: number
  // Nombre que devuelve el backend; si falta se usa el de las constantes
  nombre?: string
}

export function EstadoPaqueteBadge({ id, nombre }: EstadoBadgeProps) {
  return <Badge tone={tonoPaquete[id] ?? 'gray'}>{nombre || nombreEstadoPaquete[id] || `Estado ${id}`}</Badge>
}

export function EstadoViajeBadge({ id, nombre }: EstadoBadgeProps) {
  return <Badge tone={tonoViaje[id] ?? 'gray'}>{nombre || nombreEstadoViaje[id] || `Estado ${id}`}</Badge>
}
