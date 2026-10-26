import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorAlert } from '@/components/ui/States'
import { Textarea } from '@/components/ui/Textarea'
import { useCreatePaquete } from '@/hooks/usePaquetes'
import { applyApiFieldErrors, numberInRange, optionalText } from '@/lib/forms'
import type { ClienteDTO, PaqueteDTO } from '@/types'
import { ClienteLookup } from './ClienteLookup'
import { Comprobante } from './Comprobante'

// PaqueteCrearDTO (los clientes se eligen aparte)
const paqueteSchema = z.object({
  pesoKg: numberInRange(0.01, 100000),
  altoCm: numberInRange(0.1, 10000),
  anchoCm: numberInRange(0.1, 10000),
  largoCm: numberInRange(0.1, 10000),
  descripcion: optionalText(255),
})

type PaqueteFormInput = z.input<typeof paqueteSchema>
type PaqueteFormOutput = z.output<typeof paqueteSchema>

const paqueteFields = ['pesoKg', 'altoCm', 'anchoCm', 'largoCm', 'descripcion'] as const

const emptyPaquete: PaqueteFormInput = { pesoKg: '', altoCm: '', anchoCm: '', largoCm: '', descripcion: '' }

interface Recibido {
  paquete: PaqueteDTO
  remitente: ClienteDTO
  destinatario: ClienteDTO
}

export function RecepcionPage() {
  const [remitente, setRemitente] = useState<ClienteDTO | null>(null)
  const [destinatario, setDestinatario] = useState<ClienteDTO | null>(null)
  const [recibido, setRecibido] = useState<Recibido | null>(null)
  // Cambiar la key reinicia los buscadores de clientes
  const [ronda, setRonda] = useState(0)
  const crear = useCreatePaquete()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PaqueteFormInput, unknown, PaqueteFormOutput>({
    resolver: zodResolver(paqueteSchema),
    defaultValues: emptyPaquete,
  })

  const onSubmit = handleSubmit((values) => {
    if (!remitente || !destinatario) return
    crear.mutate(
      { ...values, idClienteRem: remitente.idCliente, idClienteDest: destinatario.idCliente },
      {
        onSuccess: (paquete) => setRecibido({ paquete, remitente, destinatario }),
        onError: (error) => applyApiFieldErrors(error, setError, paqueteFields),
      },
    )
  })

  const nuevaRecepcion = () => {
    setRecibido(null)
    setRemitente(null)
    setDestinatario(null)
    setRonda((r) => r + 1)
    crear.reset()
    reset(emptyPaquete)
  }

  if (recibido) return <Comprobante {...recibido} onNueva={nuevaRecepcion} />

  const faltanClientes = !remitente || !destinatario

  return (
    <>
      <PageHeader title="Recepción" description="Alta de encomiendas en el depósito." />

      <div className="grid gap-5 xl:grid-cols-2">
        <ClienteLookup key={`rem-${ronda}`} titulo="1. Remitente" cliente={remitente} onChange={setRemitente} />
        <ClienteLookup key={`dest-${ronda}`} titulo="2. Destinatario" cliente={destinatario} onChange={setDestinatario} />
      </div>

      <Card className="mt-5">
        <CardHeader title="3. Datos del paquete" />
        <CardBody>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Input label="Peso (kg)" required type="number" step="0.01" min={0.01} inputMode="decimal" error={errors.pesoKg?.message} {...register('pesoKg')} />
              <Input label="Alto (cm)" required type="number" step="0.1" min={0.1} inputMode="decimal" error={errors.altoCm?.message} {...register('altoCm')} />
              <Input label="Ancho (cm)" required type="number" step="0.1" min={0.1} inputMode="decimal" error={errors.anchoCm?.message} {...register('anchoCm')} />
              <Input label="Largo (cm)" required type="number" step="0.1" min={0.1} inputMode="decimal" error={errors.largoCm?.message} {...register('largoCm')} />
            </div>
            <Textarea label="Descripción" maxLength={255} placeholder="Contenido, cantidad de bultos, etc." error={errors.descripcion?.message} {...register('descripcion')} />

            <ErrorAlert error={crear.error} knownFields={paqueteFields} />

            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
              {faltanClientes && <p className="text-sm text-slate-500">Elegí remitente y destinatario para continuar.</p>}
              <Button type="submit" size="lg" disabled={faltanClientes} loading={crear.isPending}>
                Registrar encomienda
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
