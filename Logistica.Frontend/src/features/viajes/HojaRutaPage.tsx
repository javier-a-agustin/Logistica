import { Link, useLocation, useParams } from 'react-router'
import { EstadoPaqueteBadge } from '@/components/EstadoBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, QueryState } from '@/components/ui/States'
import { Table, type Column } from '@/components/ui/Table'
import { useHojaRuta } from '@/hooks/useViajes'
import { formatDimensiones, formatDireccion, formatKg } from '@/lib/format'
import type { HojaRutaItemDTO } from '@/types'
import { HojaRutaResumen } from './HojaRutaResumen'

const columns: Column<HojaRutaItemDTO>[] = [
  { header: 'Orden', cell: (e) => <span className="font-semibold text-slate-900">{e.ordenEntrega}</span> },
  {
    header: 'Código',
    cell: (e) => (
      <Link to={`/seguimiento/${e.codigoSeguimiento}`} className="font-mono whitespace-nowrap text-brand-600 hover:underline">
        {e.codigoSeguimiento}
      </Link>
    ),
  },
  {
    header: 'Destinatario',
    cell: (e) => (
      <>
        <p className="font-medium text-slate-800">{e.destinatario}</p>
        {e.telefonoDestinatario && <p className="text-xs text-slate-500">{e.telefonoDestinatario}</p>}
      </>
    ),
  },
  {
    header: 'Dirección',
    cell: (e) => (
      <>
        <p>{formatDireccion(e.calle, e.altura, e.pisoDepto)}</p>
        <p className="text-xs text-slate-500">
          {e.localidad} ({e.codigoPostal}), {e.provincia}
        </p>
      </>
    ),
  },
  {
    header: 'Paquete',
    cell: (e) => (
      <>
        <p className="whitespace-nowrap">{formatKg(e.pesoKg)}</p>
        <p className="text-xs whitespace-nowrap text-slate-500">{formatDimensiones(e.altoCm, e.anchoCm, e.largoCm)}</p>
      </>
    ),
    hideOnMobile: true,
  },
  { header: 'Estado', cell: (e) => <EstadoPaqueteBadge id={e.idEstadoActual} nombre={e.estadoActual} /> },
]

// Hoja de ruta para despachante / gerente
export function HojaRutaPage() {
  const id = Number(useParams().id)
  const location = useLocation()
  const creado = (location.state as { creado?: boolean } | null)?.creado
  const hojaRuta = useHojaRuta(id)

  return (
    <>
      <PageHeader
        title="Hoja de ruta"
        description={
          <Link to="/viajes" className="text-brand-600 hover:underline print:hidden">
            ← Volver a viajes
          </Link>
        }
        actions={
          hojaRuta.data && (
            <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
              Imprimir
            </Button>
          )
        }
      />

      {creado && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden" role="status">
          Viaje creado. Los paquetes pasaron a “En tránsito” y el chofer ya puede ver su hoja de ruta.
        </div>
      )}

      {!Number.isInteger(id) || id <= 0 ? (
        <Card>
          <EmptyState title="Viaje inválido" />
        </Card>
      ) : (
        <QueryState query={hojaRuta} loadingLabel="Cargando hoja de ruta…">
          {(data) => (
            <div className="space-y-5">
              <HojaRutaResumen hojaRuta={data} />
              <Card>
                <CardHeader title="Entregas" description={`${data.entregas.length} paquete(s) en orden de entrega`} />
                {data.entregas.length === 0 ? (
                  <EmptyState title="El viaje no tiene entregas" />
                ) : (
                  <Table columns={columns} rows={[...data.entregas].sort((a, b) => a.ordenEntrega - b.ordenEntrega)} rowKey={(e) => e.idPaquete} />
                )}
              </Card>
            </div>
          )}
        </QueryState>
      )}
    </>
  )
}
