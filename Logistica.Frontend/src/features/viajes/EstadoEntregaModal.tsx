import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ErrorAlert } from '@/components/ui/States'
import { Textarea } from '@/components/ui/Textarea'
import { useUpdateEstadoPaquete } from '@/hooks/useViajes'
import { EstadosPaquete } from '@/lib/constants'
import { applyApiFieldErrors } from '@/lib/forms'
import type { HojaRutaItemDTO } from '@/types'

export type ResultadoEntrega = typeof EstadosPaquete.Entregado | typeof EstadosPaquete.Cancelado

// ActualizarEstadoPaqueteDTO: [MaxLength(255)] Observacion, obligatoria al cancelar
const schemas = {
  [EstadosPaquete.Entregado]: z.object({
    observacion: z.string().trim().max(255, 'Máximo 255 caracteres'),
  }),
  [EstadosPaquete.Cancelado]: z.object({
    observacion: z.string().trim().min(1, 'Indicá el motivo por el que no se pudo entregar').max(255, 'Máximo 255 caracteres'),
  }),
}

interface EstadoEntregaModalProps {
  idViaje: number
  entrega: HojaRutaItemDTO | null
  estado: ResultadoEntrega
  onClose: () => void
}

export function EstadoEntregaModal({ idViaje, entrega, estado, onClose }: EstadoEntregaModalProps) {
  const cancelar = estado === EstadosPaquete.Cancelado
  return (
    <Modal
      open={!!entrega}
      onClose={onClose}
      title={cancelar ? 'Entrega cancelada' : 'Confirmar entrega'}
      description={entrega ? `${entrega.ordenEntrega}. ${entrega.destinatario} · ${entrega.codigoSeguimiento}` : undefined}
    >
      {entrega && <EstadoEntregaForm key={`${entrega.idPaquete}-${estado}`} idViaje={idViaje} entrega={entrega} estado={estado} onClose={onClose} />}
    </Modal>
  )
}

function EstadoEntregaForm({ idViaje, entrega, estado, onClose }: EstadoEntregaModalProps & { entrega: HojaRutaItemDTO }) {
  const cancelar = estado === EstadosPaquete.Cancelado
  const actualizar = useUpdateEstadoPaquete(idViaje)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ observacion: string }>({
    resolver: zodResolver(schemas[estado]),
    defaultValues: { observacion: '' },
  })

  const onSubmit = handleSubmit(({ observacion }) => {
    actualizar.mutate(
      { idPaquete: entrega.idPaquete, estado: { idEstadoPaquete: estado, observacion: observacion || null } },
      {
        onSuccess: onClose,
        onError: (error) => applyApiFieldErrors(error, setError, ['observacion']),
      },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-sm text-slate-600">
        {cancelar
          ? 'El paquete quedará como “Cancelado”. Esta acción no se puede deshacer.'
          : 'El paquete quedará como “Entregado”. Esta acción no se puede deshacer.'}
      </p>
      <Textarea
        label={cancelar ? 'Motivo' : 'Observación (opcional)'}
        required={cancelar}
        maxLength={255}
        rows={4}
        autoFocus={cancelar}
        placeholder={cancelar ? 'Ej: destinatario ausente, dirección inexistente…' : 'Ej: recibió el portero'}
        error={errors.observacion?.message}
        {...register('observacion')}
      />
      <ErrorAlert error={actualizar.error} knownFields={['observacion']} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="lg" onClick={onClose} disabled={actualizar.isPending}>
          Volver
        </Button>
        <Button type="submit" size="lg" variant={cancelar ? 'danger' : 'success'} loading={actualizar.isPending}>
          {cancelar ? 'Confirmar cancelación' : 'Confirmar entrega'}
        </Button>
      </div>
    </form>
  )
}
