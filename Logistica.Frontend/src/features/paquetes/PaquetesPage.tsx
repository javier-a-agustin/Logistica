import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { EstadoPaqueteBadge } from '@/components/EstadoBadge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { EmptyState, QueryState } from '@/components/ui/States'
import { Table, type Column } from '@/components/ui/Table'
import { useEstadosPaquete } from '@/hooks/useCatalogos'
import { usePaquetes } from '@/hooks/usePaquetes'
import { Roles } from '@/lib/constants'
import { formatDateTime, formatDimensiones, formatKg } from '@/lib/format'
import type { PaqueteDTO } from '@/types'

const columns: Column<PaqueteDTO>[] = [
  {
    header: 'Código',
    cell: (p) => (
      <Link to={`/seguimiento/${p.codigoSeguimiento}`} className="font-mono whitespace-nowrap text-brand-600 hover:underline">
        {p.codigoSeguimiento}
      </Link>
    ),
  },
  { header: 'Remitente', cell: (p) => p.remitente, hideOnMobile: true },
  { header: 'Destinatario', cell: (p) => p.destinatario },
  { header: 'Peso', cell: (p) => formatKg(p.pesoKg), className: 'text-right whitespace-nowrap' },
  {
    header: 'Dimensiones',
    cell: (p) => formatDimensiones(p.altoCm, p.anchoCm, p.largoCm),
    className: 'whitespace-nowrap',
    hideOnMobile: true,
  },
  { header: 'Ingreso', cell: (p) => formatDateTime(p.fechaIngreso), className: 'whitespace-nowrap', hideOnMobile: true },
  { header: 'Estado', cell: (p) => <EstadoPaqueteBadge id={p.idEstadoActual} nombre={p.estadoActual} /> },
]

export function PaquetesPage() {
  const { hasRole } = useAuth()
  const [idEstado, setIdEstado] = useState('')
  const [filtro, setFiltro] = useState('')
  const estados = useEstadosPaquete()
  const paquetes = usePaquetes(Number(idEstado) || undefined)

  const texto = filtro.trim().toLowerCase()
  const filtrar = (data: PaqueteDTO[]) =>
    texto
      ? data.filter((p) => [p.codigoSeguimiento, p.remitente, p.destinatario].some((v) => v.toLowerCase().includes(texto)))
      : data

  return (
    <>
      <PageHeader
        title="Paquetes"
        description="Encomiendas registradas y su estado actual."
        actions={
          hasRole(Roles.Recepcionista, Roles.Gerente) && (
            <Link
              to="/recepcion"
              className="inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Nueva recepción
            </Link>
          )
        }
      />
      <Card>
        <div className="grid gap-3 border-b border-slate-200 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:px-5">
          <Select label="Estado" value={idEstado} onChange={(e) => setIdEstado(e.target.value)} placeholder="Todos">
            {estados.data?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
          <Input label="Buscar" placeholder="Código, remitente o destinatario" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        </div>
        <QueryState
          query={paquetes}
          isEmpty={(data) => filtrar(data).length === 0}
          empty={
            <EmptyState
              title="No hay paquetes"
              description={idEstado || texto ? 'Ningún paquete coincide con los filtros.' : 'Todavía no se registró ninguna encomienda.'}
            />
          }
        >
          {(data) => <Table columns={columns} rows={filtrar(data)} rowKey={(p) => p.idPaquete} />}
        </QueryState>
      </Card>
    </>
  )
}
