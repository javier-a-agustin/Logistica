import { EstadoViajeBadge } from '@/components/EstadoBadge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/format'
import type { HojaRutaDTO } from '@/types'
import { contarEntregas } from './entregas'
import { PesoBar } from './PesoBar'

// Encabezado de la hoja de ruta (lo usan el despachante y el chofer)
export function HojaRutaResumen({ hojaRuta }: { hojaRuta: HojaRutaDTO }) {
  const { total, resueltas } = contarEntregas(hojaRuta)

  return (
    <Card>
      <CardHeader
        title={`Viaje #${hojaRuta.idViaje}`}
        description={`${hojaRuta.patente} · ${hojaRuta.vehiculo}`}
        actions={<EstadoViajeBadge id={hojaRuta.idEstadoViaje} nombre={hojaRuta.estadoViaje} />}
      />
      <CardBody className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500 uppercase">Chofer</dt>
            <dd className="font-medium text-slate-800">{hojaRuta.chofer}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 uppercase">Despachante</dt>
            <dd className="font-medium text-slate-800">{hojaRuta.despachante}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 uppercase">Salida</dt>
            <dd className="font-medium text-slate-800">{formatDateTime(hojaRuta.fechaSalida)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 uppercase">Llegada estimada</dt>
            <dd className="font-medium text-slate-800">{formatDateTime(hojaRuta.fechaLlegadaEstimada)}</dd>
          </div>
        </dl>
        <div className="grid gap-4 sm:grid-cols-2">
          <PesoBar pesoKg={hojaRuta.pesoTotalKg} capacidadKg={hojaRuta.capacidadKg} />
          <div>
            <div className="mb-1.5 flex justify-between text-sm text-slate-600">
              <span>Entregas resueltas</span>
              <span className="font-medium tabular-nums">
                {resueltas} / {total}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${total ? (resueltas / total) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
