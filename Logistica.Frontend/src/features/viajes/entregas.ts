import { EstadosPaquete } from '@/lib/constants'
import type { HojaRutaDTO } from '@/types'

// Pendiente = sigue "En tránsito"; resuelta = Entregado o Cancelado
export function contarEntregas(hojaRuta: HojaRutaDTO) {
  const pendientes = hojaRuta.entregas.filter((e) => e.idEstadoActual === EstadosPaquete.EnTransito).length
  return { total: hojaRuta.entregas.length, pendientes, resueltas: hojaRuta.entregas.length - pendientes }
}
