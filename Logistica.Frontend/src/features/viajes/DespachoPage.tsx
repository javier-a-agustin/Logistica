import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { EmptyState, ErrorAlert, QueryState } from '@/components/ui/States'
import { useCreateViaje, useDisponiblesDespacho } from '@/hooks/useViajes'
import { cn } from '@/lib/cn'
import { datetimeLocalToApi, formatDateTime, formatDimensiones, formatKg } from '@/lib/format'
import type { DisponiblesDespachoDTO, PaqueteDTO } from '@/types'
import { PesoBar } from './PesoBar'

export function DespachoPage() {
  const disponibles = useDisponiblesDespacho()

  return (
    <>
      <PageHeader
        title="Despacho"
        description="Armá un viaje: elegí vehículo y chofer, sumá paquetes en depósito y definí el orden de entrega."
        actions={
          <Button variant="secondary" size="sm" onClick={() => void disponibles.refetch()} loading={disponibles.isRefetching}>
            Actualizar
          </Button>
        }
      />
      <QueryState query={disponibles} loadingLabel="Cargando paquetes, vehículos y choferes disponibles…">
        {(data) => <ArmadoViaje disponibles={data} />}
      </QueryState>
    </>
  )
}

function ArmadoViaje({ disponibles }: { disponibles: DisponiblesDespachoDTO }) {
  const navigate = useNavigate()
  const crear = useCreateViaje()

  const [idVehiculo, setIdVehiculo] = useState('')
  const [idChofer, setIdChofer] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')
  const [fechaLlegada, setFechaLlegada] = useState('')
  // Ids en orden de entrega
  const [seleccion, setSeleccion] = useState<number[]>([])
  const [filtro, setFiltro] = useState('')

  const paquetesPorId = useMemo(() => new Map(disponibles.paquetes.map((p) => [p.idPaquete, p])), [disponibles.paquetes])
  // Si un paquete dejó de estar disponible (lo despachó otro usuario) se descarta de la selección
  const seleccionados = seleccion.map((id) => paquetesPorId.get(id)).filter((p): p is PaqueteDTO => !!p)
  const vehiculo = disponibles.vehiculos.find((v) => v.idVehiculo === Number(idVehiculo))
  const pesoTotal = seleccionados.reduce((total, p) => total + p.pesoKg, 0)
  const excedido = !!vehiculo && pesoTotal > vehiculo.capacidadKg

  const texto = filtro.trim().toLowerCase()
  const paquetesFiltrados = texto
    ? disponibles.paquetes.filter((p) =>
        [p.codigoSeguimiento, p.destinatario, p.remitente, p.descripcion ?? ''].some((v) => v.toLowerCase().includes(texto)),
      )
    : disponibles.paquetes

  // Formato "yyyy-MM-ddTHH:mm": se compara como texto. Sin salida, el backend toma "ahora" y valida él
  const errorFechas =
    fechaSalida && fechaLlegada && fechaLlegada < fechaSalida
      ? 'La llegada estimada no puede ser anterior a la salida'
      : undefined

  const faltantes = [
    !vehiculo && 'un vehículo',
    !idChofer && 'un chofer',
    seleccionados.length === 0 && 'al menos un paquete',
  ].filter(Boolean)

  const puedeCrear = faltantes.length === 0 && !excedido && !errorFechas

  const toggle = (id: number) =>
    setSeleccion((actual) => (actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]))

  const mover = (index: number, delta: number) =>
    setSeleccion((actual) => {
      const ids = actual.filter((id) => paquetesPorId.has(id))
      const destino = index + delta
      if (destino < 0 || destino >= ids.length) return ids
      ;[ids[index], ids[destino]] = [ids[destino]!, ids[index]!]
      return ids
    })

  const confirmar = () => {
    if (!puedeCrear || !vehiculo) return
    crear.mutate(
      {
        idVehiculo: vehiculo.idVehiculo,
        idChofer: Number(idChofer),
        fechaSalida: datetimeLocalToApi(fechaSalida),
        fechaLlegadaEstimada: datetimeLocalToApi(fechaLlegada),
        paquetes: seleccionados.map((p, i) => ({ idPaquete: p.idPaquete, ordenEntrega: i + 1 })),
      },
      { onSuccess: (hojaRuta) => navigate(`/viajes/${hojaRuta.idViaje}`, { state: { creado: true } }) },
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-5">
        <Card>
          <CardHeader title="Vehículo, chofer y fechas" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Vehículo"
              required
              placeholder={disponibles.vehiculos.length ? 'Seleccioná…' : 'No hay vehículos disponibles'}
              disabled={!disponibles.vehiculos.length}
              value={idVehiculo}
              onChange={(e) => setIdVehiculo(e.target.value)}
              hint="Vehículos activos sin viaje en curso"
            >
              {disponibles.vehiculos.map((v) => (
                <option key={v.idVehiculo} value={v.idVehiculo}>
                  {v.patente} — {v.nombreMarca} {v.nombreModelo} ({formatKg(v.capacidadKg)})
                </option>
              ))}
            </Select>
            <Select
              label="Chofer"
              required
              placeholder={disponibles.choferes.length ? 'Seleccioná…' : 'No hay choferes habilitados'}
              disabled={!disponibles.choferes.length}
              value={idChofer}
              onChange={(e) => setIdChofer(e.target.value)}
              hint="Activos, con licencia vigente y sin viaje en curso"
            >
              {disponibles.choferes.map((c) => (
                <option key={c.idChofer} value={c.idChofer}>
                  {c.apellido}, {c.nombre} — DNI {c.dni}
                </option>
              ))}
            </Select>
            <Input
              label="Salida"
              type="datetime-local"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              hint="Vacío = ahora"
            />
            <Input
              label="Llegada estimada"
              type="datetime-local"
              value={fechaLlegada}
              min={fechaSalida || undefined}
              onChange={(e) => setFechaLlegada(e.target.value)}
              error={errorFechas}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Paquetes en depósito"
            description={`${disponibles.paquetes.length} disponible(s) · ${seleccionados.length} seleccionado(s)`}
          />
          {disponibles.paquetes.length === 0 ? (
            <EmptyState title="No hay paquetes en depósito" description="Los paquetes aparecen acá cuando se registran en Recepción." />
          ) : (
            <>
              <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
                <Input
                  placeholder="Filtrar por código, destinatario, remitente o descripción"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  aria-label="Filtrar paquetes"
                />
              </div>
              {paquetesFiltrados.length === 0 ? (
                <EmptyState title="Ningún paquete coincide con el filtro" />
              ) : (
                <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
                  {paquetesFiltrados.map((p) => {
                    const orden = seleccion.indexOf(p.idPaquete)
                    return (
                      <li key={p.idPaquete}>
                        <label
                          className={cn(
                            'flex cursor-pointer items-start gap-3 px-4 py-3 sm:px-5',
                            orden >= 0 ? 'bg-brand-50' : 'hover:bg-slate-50',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 size-4 accent-brand-600"
                            checked={orden >= 0}
                            onChange={() => toggle(p.idPaquete)}
                          />
                          <div className="min-w-0 flex-1 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-x-3">
                              <span className="font-mono font-medium text-slate-900">{p.codigoSeguimiento}</span>
                              <span className="font-semibold text-slate-900">{formatKg(p.pesoKg)}</span>
                            </div>
                            <p className="text-slate-700">Para: {p.destinatario}</p>
                            <p className="text-xs text-slate-500">
                              {formatDimensiones(p.altoCm, p.anchoCm, p.largoCm)} · Ingreso {formatDateTime(p.fechaIngreso)}
                              {p.descripcion && ` · ${p.descripcion}`}
                            </p>
                          </div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Resumen del viaje */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader title="Resumen del viaje" />
          <CardBody className="space-y-4">
            <PesoBar pesoKg={pesoTotal} capacidadKg={vehiculo?.capacidadKg} />

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Orden de entrega</p>
              {seleccionados.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
                  Seleccioná paquetes de la lista.
                </p>
              ) : (
                <ol className="space-y-2">
                  {seleccionados.map((p, i) => (
                    <li key={p.idPaquete} className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">{p.destinatario}</p>
                        <p className="truncate font-mono text-xs text-slate-500">
                          {p.codigoSeguimiento} · {formatKg(p.pesoKg)}
                        </p>
                      </div>
                      <div className="flex shrink-0">
                        <Button variant="ghost" size="sm" className="px-2" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={() => mover(i, 1)}
                          disabled={i === seleccionados.length - 1}
                          aria-label="Bajar"
                        >
                          ↓
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2 text-red-600" onClick={() => toggle(p.idPaquete)} aria-label="Quitar">
                          ✕
                        </Button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <ErrorAlert error={crear.error} />

            <Button size="lg" className="w-full" disabled={!puedeCrear} loading={crear.isPending} onClick={confirmar}>
              Crear viaje
            </Button>
            {faltantes.length > 0 && <p className="text-center text-xs text-slate-500">Falta elegir {faltantes.join(', ')}.</p>}
            {excedido && <p className="text-center text-xs font-medium text-red-600">Quitá paquetes o elegí un vehículo con más capacidad.</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
