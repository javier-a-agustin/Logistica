import { Link } from 'react-router'
import { EstadoViajeBadge } from '@/components/EstadoBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, QueryState } from '@/components/ui/States'
import { useMisViajes } from '@/hooks/useViajes'
import { formatDateTime, formatKg } from '@/lib/format'
import { contarEntregas } from './entregas'

// Fase 3: viajes en curso del chofer autenticado
export function MisViajesPage() {
  const viajes = useMisViajes()

  return (
    <>
      <PageHeader
        title="Mis viajes"
        description="Tus hojas de ruta en curso."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void viajes.refetch()} loading={viajes.isRefetching}>
            Actualizar
          </Button>
        }
      />
      <QueryState
        query={viajes}
        isEmpty={(data) => data.length === 0}
        empty={
          <Card>
            <EmptyState title="No tenés viajes en curso" description="Cuando el despachante te asigne un viaje lo vas a ver acá." />
          </Card>
        }
      >
        {(data) => (
          <ul className="space-y-3">
            {data.map((hojaRuta) => {
              const { total, pendientes, resueltas } = contarEntregas(hojaRuta)
              return (
                <li key={hojaRuta.idViaje}>
                  <Link
                    to={`/mis-viajes/${hojaRuta.idViaje}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50/40 active:bg-brand-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">Viaje #{hojaRuta.idViaje}</p>
                        <p className="text-sm text-slate-500">
                          <span className="font-mono">{hojaRuta.patente}</span> · {hojaRuta.vehiculo}
                        </p>
                      </div>
                      <EstadoViajeBadge id={hojaRuta.idEstadoViaje} nombre={hojaRuta.estadoViaje} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Salida {formatDateTime(hojaRuta.fechaSalida)} · {formatKg(hojaRuta.pesoTotalKg)}
                    </p>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {pendientes > 0 ? `${pendientes} entrega(s) pendiente(s)` : 'Todas las entregas resueltas'}
                        </span>
                        <span className="text-slate-500 tabular-nums">
                          {resueltas}/{total}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${total ? (resueltas / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-medium text-brand-600">Abrir hoja de ruta →</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </QueryState>
    </>
  )
}
