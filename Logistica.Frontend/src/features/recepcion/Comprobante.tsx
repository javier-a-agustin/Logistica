import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDateTime, formatDimensiones, formatDireccion, formatKg, nombreCompleto } from '@/lib/format'
import type { ClienteDTO, PaqueteDTO } from '@/types'

interface ComprobanteProps {
  paquete: PaqueteDTO
  remitente: ClienteDTO
  destinatario: ClienteDTO
  onNueva: () => void
}

// Comprobante de recepción. Al imprimir se ocultan el menú y los botones
export function Comprobante({ paquete, remitente, destinatario, onNueva }: ComprobanteProps) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(paquete.codigoSeguimiento)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Sin permiso de portapapeles: el código queda visible para copiarlo a mano
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 print:hidden" role="status">
        Encomienda registrada correctamente.
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardBody className="space-y-6 print:p-0">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">Logística — Comprobante de recepción</p>
              <p className="text-sm text-slate-500">{formatDateTime(paquete.fechaIngreso)}</p>
            </div>
            <p className="text-right text-sm text-slate-500">
              Atendió
              <br />
              <span className="font-medium text-slate-700">{paquete.usuarioRecepcion}</span>
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 px-4 py-5 text-center print:bg-white print:ring-1 print:ring-slate-300">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Código de seguimiento</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-wider break-all text-slate-900 sm:text-3xl">
              {paquete.codigoSeguimiento}
            </p>
            <Button variant="ghost" size="sm" className="mt-2 print:hidden" onClick={() => void copiar()}>
              {copiado ? '¡Copiado!' : 'Copiar código'}
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ClienteBloque titulo="Remitente" cliente={remitente} />
            <ClienteBloque titulo="Destinatario" cliente={destinatario} />
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-dashed border-slate-300 pt-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500 uppercase">Peso</dt>
              <dd className="font-medium">{formatKg(paquete.pesoKg)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 uppercase">Alto × ancho × largo</dt>
              <dd className="font-medium">{formatDimensiones(paquete.altoCm, paquete.anchoCm, paquete.largoCm)}</dd>
            </div>
            {paquete.descripcion && (
              <div className="col-span-2">
                <dt className="text-xs text-slate-500 uppercase">Descripción</dt>
                <dd>{paquete.descripcion}</dd>
              </div>
            )}
          </dl>

          <p className="text-center text-xs text-slate-500">
            Consultá el estado de tu envío con el código de seguimiento.
          </p>
        </CardBody>
      </Card>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end print:hidden">
        <Button variant="secondary" onClick={onNueva}>
          Nueva recepción
        </Button>
        <Button onClick={() => window.print()}>Imprimir comprobante</Button>
      </div>
    </div>
  )
}

function ClienteBloque({ titulo, cliente }: { titulo: string; cliente: ClienteDTO }) {
  return (
    <div className="text-sm">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{titulo}</p>
      <p className="mt-1 font-semibold text-slate-900">{nombreCompleto(cliente.razonSocialNombre, cliente.apellido)}</p>
      <p className="text-slate-600">
        {cliente.tipoDocumento} {cliente.numeroDocumento}
      </p>
      <p className="text-slate-600">{formatDireccion(cliente.calle, cliente.altura, cliente.pisoDepto)}</p>
      <p className="text-slate-600">
        {cliente.nombreLocalidad} ({cliente.codigoPostal}), {cliente.nombreProvincia}
      </p>
    </div>
  )
}
