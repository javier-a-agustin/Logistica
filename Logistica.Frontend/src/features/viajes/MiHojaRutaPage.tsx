import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { EstadoPaqueteBadge } from '@/components/EstadoBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState, ErrorAlert, QueryState } from '@/components/ui/States'
import { useFinalizarViaje, useHojaRuta } from '@/hooks/useViajes'
import { cn } from '@/lib/cn'
import { EstadosPaquete, EstadosViaje } from '@/lib/constants'
import { formatDimensiones, formatDireccion, formatKg } from '@/lib/format'
import type { HojaRutaDTO, HojaRutaItemDTO } from '@/types'
import { contarEntregas } from './entregas'
import { EstadoEntregaModal, type ResultadoEntrega } from './EstadoEntregaModal'
import { HojaRutaResumen } from './HojaRutaResumen'

// Fase 3: hoja de ruta del chofer, pensada para el celular
export function MiHojaRutaPage() {
  const id = Number(useParams().id)
  const hojaRuta = useHojaRuta(id)

  return (
    <>
      <Link to="/mis-viajes" className="mb-3 inline-block text-sm font-medium text-brand-600 hover:underline">
        ← Mis viajes
      </Link>
      {!Number.isInteger(id) || id <= 0 ? (
        <Card>
          <EmptyState title="Viaje inválido" />
        </Card>
      ) : (
        <QueryState query={hojaRuta} loadingLabel="Cargando hoja de ruta…">
          {(data) => <HojaRutaChofer hojaRuta={data} />}
        </QueryState>
      )}
    </>
  )
}

function HojaRutaChofer({ hojaRuta }: { hojaRuta: HojaRutaDTO }) {
  const [accion, setAccion] = useState<{ entrega: HojaRutaItemDTO; estado: ResultadoEntrega } | null>(null)
  const [confirmarFin, setConfirmarFin] = useState(false)
  const finalizar = useFinalizarViaje()

  const enCurso = hojaRuta.idEstadoViaje === EstadosViaje.EnCurso
  const { pendientes } = contarEntregas(hojaRuta)
  const entregas = [...hojaRuta.entregas].sort((a, b) => a.ordenEntrega - b.ordenEntrega)
  // La próxima entrega es la primera pendiente según el orden
  const proxima = entregas.find((e) => e.idEstadoActual === EstadosPaquete.EnTransito)

  return (
    <div className={cn('space-y-4', enCurso && 'pb-24')}>
      <HojaRutaResumen hojaRuta={hojaRuta} />

      {hojaRuta.idEstadoViaje === EstadosViaje.Finalizado && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          Viaje finalizado. ¡Buen trabajo!
        </div>
      )}

      <h2 className="pt-1 text-base font-semibold text-slate-900">Entregas</h2>
      <ul className="space-y-3">
        {entregas.map((entrega) => (
          <li key={entrega.idPaquete}>
            <EntregaCard
              entrega={entrega}
              destacada={entrega === proxima}
              puedeOperar={enCurso}
              onResultado={(estado) => setAccion({ entrega, estado })}
            />
          </li>
        ))}
      </ul>

      {enCurso && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:left-60 print:hidden">
          <div className="mx-auto flex max-w-3xl flex-col gap-1">
            <Button size="lg" className="w-full" disabled={pendientes > 0} onClick={() => setConfirmarFin(true)}>
              Finalizar viaje
            </Button>
            {pendientes > 0 && (
              <p className="text-center text-xs text-slate-500">Quedan {pendientes} entrega(s) sin resolver.</p>
            )}
          </div>
        </div>
      )}

      <EstadoEntregaModal
        idViaje={hojaRuta.idViaje}
        entrega={accion?.entrega ?? null}
        estado={accion?.estado ?? EstadosPaquete.Entregado}
        onClose={() => setAccion(null)}
      />

      <ConfirmDialog
        open={confirmarFin}
        title="Finalizar viaje"
        message="Se cerrará el recorrido. Verificá que todas las entregas estén registradas."
        confirmLabel="Finalizar"
        loading={finalizar.isPending}
        error={<ErrorAlert error={finalizar.error} />}
        onConfirm={() => finalizar.mutate(hojaRuta.idViaje, { onSuccess: () => setConfirmarFin(false) })}
        onClose={() => {
          setConfirmarFin(false)
          finalizar.reset()
        }}
      />
    </div>
  )
}

interface EntregaCardProps {
  entrega: HojaRutaItemDTO
  destacada: boolean
  puedeOperar: boolean
  onResultado: (estado: ResultadoEntrega) => void
}

function EntregaCard({ entrega, destacada, puedeOperar, onResultado }: EntregaCardProps) {
  const pendiente = entrega.idEstadoActual === EstadosPaquete.EnTransito
  const direccion = formatDireccion(entrega.calle, entrega.altura, entrega.pisoDepto)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${entrega.calle} ${entrega.altura}, ${entrega.localidad}, ${entrega.provincia}, Argentina`,
  )}`

  return (
    <Card className={cn('overflow-hidden', destacada && 'ring-2 ring-brand-500', !pendiente && 'bg-slate-50')}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              pendiente ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600',
            )}
          >
            {entrega.ordenEntrega}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cn('text-base font-semibold', pendiente ? 'text-slate-900' : 'text-slate-500')}>{entrega.destinatario}</p>
              <EstadoPaqueteBadge id={entrega.idEstadoActual} nombre={entrega.estadoActual} />
            </div>
            {destacada && <p className="text-xs font-medium text-brand-600">Próxima entrega</p>}
            <p className="mt-1 text-sm text-slate-700">{direccion}</p>
            <p className="text-sm text-slate-500">
              {entrega.localidad} ({entrega.codigoPostal}), {entrega.provincia}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-mono">{entrega.codigoSeguimiento}</span> · {formatKg(entrega.pesoKg)} ·{' '}
              {formatDimensiones(entrega.altoCm, entrega.anchoCm, entrega.largoCm)}
            </p>
            {entrega.descripcion && <p className="text-xs text-slate-500">{entrega.descripcion}</p>}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                Ver en mapa
              </a>
              {entrega.telefonoDestinatario && (
                <a href={`tel:${entrega.telefonoDestinatario}`} className="font-medium text-brand-600 hover:underline">
                  Llamar {entrega.telefonoDestinatario}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {pendiente && puedeOperar && (
        <div className="grid grid-cols-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onResultado(EstadosPaquete.Cancelado)}
            className="h-12 border-r border-slate-200 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100"
          >
            No entregado
          </button>
          <button
            type="button"
            onClick={() => onResultado(EstadosPaquete.Entregado)}
            className="h-12 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100"
          >
            Entregado
          </button>
        </div>
      )}
    </Card>
  )
}
