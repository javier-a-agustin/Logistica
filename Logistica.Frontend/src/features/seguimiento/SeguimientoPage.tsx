import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { isApiError } from '@/api/client'
import { EstadoPaqueteBadge } from '@/components/EstadoBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { useSeguimiento } from '@/hooks/usePaquetes'
import { formatDateTime, formatDimensiones, formatKg } from '@/lib/format'
import type { PaqueteDTO } from '@/types'
import { HistorialTimeline } from './HistorialTimeline'

export function SeguimientoPage() {
  const { codigo = '' } = useParams()
  const navigate = useNavigate()
  const [texto, setTexto] = useState(codigo)
  const seguimiento = useSeguimiento(codigo)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const valor = texto.trim().toUpperCase()
    if (valor) navigate(`/seguimiento/${encodeURIComponent(valor)}`)
  }

  return (
    <>
      <PageHeader title="Seguimiento" description="Consultá el estado y el recorrido de una encomienda por su código." />

      <Card className="mb-5">
        <CardBody>
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Código de seguimiento"
              placeholder="TLS-261020-K7M2QA"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              containerClassName="flex-1"
              className="font-mono uppercase"
            />
            <Button type="submit" disabled={!texto.trim()} loading={seguimiento.isFetching}>
              Buscar
            </Button>
          </form>
        </CardBody>
      </Card>

      {!codigo ? (
        <Card>
          <EmptyState title="Ingresá un código para ver el recorrido" description="El código figura en el comprobante entregado al recibir la encomienda." />
        </Card>
      ) : seguimiento.isPending ? (
        <Card>
          <LoadingState label="Buscando encomienda…" />
        </Card>
      ) : seguimiento.isError ? (
        <Card>
          {isApiError(seguimiento.error) && seguimiento.error.status === 404 ? (
            <EmptyState title="No encontramos esa encomienda" description={`No existe un paquete con el código ${codigo}.`} />
          ) : (
            <ErrorState error={seguimiento.error} onRetry={() => void seguimiento.refetch()} />
          )}
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          <PaqueteResumen paquete={seguimiento.data.paquete} className="lg:col-span-2" />
          <Card className="lg:col-span-3">
            <CardHeader title="Historial" description={`${seguimiento.data.historial.length} movimiento(s)`} />
            <CardBody>
              <HistorialTimeline historial={seguimiento.data.historial} />
            </CardBody>
          </Card>
        </div>
      )}
    </>
  )
}

function PaqueteResumen({ paquete, className }: { paquete: PaqueteDTO; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader
        title={<span className="font-mono">{paquete.codigoSeguimiento}</span>}
        actions={<EstadoPaqueteBadge id={paquete.idEstadoActual} nombre={paquete.estadoActual} />}
      />
      <CardBody>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Dato label="Remitente" value={paquete.remitente} />
          <Dato label="Destinatario" value={paquete.destinatario} />
          <Dato label="Peso" value={formatKg(paquete.pesoKg)} />
          <Dato label="Dimensiones (alto × ancho × largo)" value={formatDimensiones(paquete.altoCm, paquete.anchoCm, paquete.largoCm)} />
          <Dato label="Ingreso" value={formatDateTime(paquete.fechaIngreso)} />
          <Dato label="Recibido por" value={paquete.usuarioRecepcion} />
          {paquete.descripcion && <Dato label="Descripción" value={paquete.descripcion} className="sm:col-span-2 lg:col-span-1 xl:col-span-2" />}
        </dl>
      </CardBody>
    </Card>
  )
}

function Dato({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{value}</dd>
    </div>
  )
}
