import { useState } from 'react'
import { Link } from 'react-router'
import { EstadoViajeBadge } from '@/components/EstadoBadge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { EmptyState, QueryState } from '@/components/ui/States'
import { Table, type Column } from '@/components/ui/Table'
import { useEstadosViaje } from '@/hooks/useCatalogos'
import { useViajes } from '@/hooks/useViajes'
import { formatDateTime, formatKg } from '@/lib/format'
import type { ViajeDTO } from '@/types'

const columns: Column<ViajeDTO>[] = [
  { header: 'N°', cell: (v) => <span className="font-medium text-slate-900">#{v.idViaje}</span> },
  { header: 'Vehículo', cell: (v) => <span className="font-mono">{v.patente}</span> },
  { header: 'Chofer', cell: (v) => v.chofer },
  { header: 'Despachante', cell: (v) => v.despachante, hideOnMobile: true },
  { header: 'Salida', cell: (v) => formatDateTime(v.fechaSalida), className: 'whitespace-nowrap' },
  { header: 'Llegada est.', cell: (v) => formatDateTime(v.fechaLlegadaEstimada), className: 'whitespace-nowrap', hideOnMobile: true },
  { header: 'Paquetes', cell: (v) => v.cantidadPaquetes, className: 'text-right' },
  { header: 'Peso', cell: (v) => formatKg(v.pesoTotalKg), className: 'text-right whitespace-nowrap', hideOnMobile: true },
  { header: 'Estado', cell: (v) => <EstadoViajeBadge id={v.idEstadoViaje} nombre={v.estadoViaje} /> },
  {
    header: <span className="sr-only">Acciones</span>,
    cell: (v) => (
      <Link to={`/viajes/${v.idViaje}`} className="font-medium whitespace-nowrap text-brand-600 hover:underline">
        Hoja de ruta
      </Link>
    ),
    className: 'text-right',
  },
]

export function ViajesPage() {
  const [idEstado, setIdEstado] = useState('')
  const estados = useEstadosViaje()
  const viajes = useViajes(Number(idEstado) || undefined)

  return (
    <>
      <PageHeader title="Viajes" description="Viajes armados y su estado." />
      <Card>
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <Select label="Estado" value={idEstado} onChange={(e) => setIdEstado(e.target.value)} placeholder="Todos" containerClassName="w-full sm:w-56">
            {estados.data?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
        </div>
        <QueryState
          query={viajes}
          isEmpty={(data) => data.length === 0}
          empty={<EmptyState title="No hay viajes" description={idEstado ? 'Probá con otro estado.' : 'Todavía no se armó ningún viaje.'} />}
        >
          {(data) => <Table columns={columns} rows={data} rowKey={(v) => v.idViaje} />}
        </QueryState>
      </Card>
    </>
  )
}
