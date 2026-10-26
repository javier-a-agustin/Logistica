import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ErrorAlert } from '@/components/ui/States'
import { useBuscarClientePorDocumento } from '@/hooks/useClientes'
import { TiposDocumento } from '@/lib/constants'
import { requiredText } from '@/lib/forms'
import { formatDireccion, nombreCompleto } from '@/lib/format'
import type { ClienteDTO } from '@/types'
import { ClienteForm } from '../clientes/ClienteForm'

const busquedaSchema = z.object({
  tipoDocumento: requiredText(10),
  numeroDocumento: requiredText(20),
})

type Busqueda = z.infer<typeof busquedaSchema>

interface ClienteLookupProps {
  titulo: string
  cliente: ClienteDTO | null
  onChange: (cliente: ClienteDTO | null) => void
}

// Fase 1: se busca el cliente por documento; si no está registrado se da de alta en el momento
export function ClienteLookup({ titulo, cliente, onChange }: ClienteLookupProps) {
  const buscar = useBuscarClientePorDocumento()
  const [alta, setAlta] = useState<Busqueda | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Busqueda>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: { tipoDocumento: 'DNI', numeroDocumento: '' },
  })

  const onBuscar = handleSubmit((values) => {
    setAlta(null)
    buscar.mutate(values, { onSuccess: onChange })
  })

  const noRegistrado = isApiError(buscar.error) && buscar.error.status === 404
  const buscado = buscar.variables

  if (cliente) {
    return (
      <Card>
        <CardHeader
          title={titulo}
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                buscar.reset()
                onChange(null)
              }}
            >
              Cambiar
            </Button>
          }
        />
        <CardBody>
          <ClienteResumen cliente={cliente} />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={titulo} description="Buscá por documento" />
      <CardBody className="space-y-4">
        {!alta && (
          <form onSubmit={onBuscar} noValidate className="grid grid-cols-[6.5rem_1fr] gap-3 sm:grid-cols-[7rem_1fr_auto] sm:items-start">
            <Select label="Tipo" error={errors.tipoDocumento?.message} {...register('tipoDocumento')}>
              {TiposDocumento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
            <Input label="Número" inputMode="numeric" autoComplete="off" error={errors.numeroDocumento?.message} {...register('numeroDocumento')} />
            <Button type="submit" loading={buscar.isPending} className="col-span-2 sm:col-span-1 sm:mt-6">
              Buscar
            </Button>
          </form>
        )}

        {noRegistrado && buscado && !alta && (
          <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <p>
              No hay un cliente registrado con {buscado.tipoDocumento} {buscado.numeroDocumento}.
            </p>
            <Button size="sm" onClick={() => setAlta(buscado)}>
              Registrar cliente
            </Button>
          </div>
        )}
        {buscar.isError && !noRegistrado && <ErrorAlert error={buscar.error} />}

        {alta && (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Nuevo cliente</p>
            <ClienteForm
              initial={alta}
              onSaved={(nuevo) => {
                setAlta(null)
                buscar.reset()
                onChange(nuevo)
              }}
              onCancel={() => setAlta(null)}
            />
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export function ClienteResumen({ cliente }: { cliente: ClienteDTO }) {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-slate-900">{nombreCompleto(cliente.razonSocialNombre, cliente.apellido)}</p>
      <p className="text-slate-600">
        {cliente.tipoDocumento} {cliente.numeroDocumento}
      </p>
      <p className="text-slate-600">
        {formatDireccion(cliente.calle, cliente.altura, cliente.pisoDepto)} — {cliente.nombreLocalidad} ({cliente.codigoPostal}),{' '}
        {cliente.nombreProvincia}
      </p>
      {(cliente.telefono || cliente.email) && (
        <p className="text-slate-500">{[cliente.telefono, cliente.email].filter(Boolean).join(' · ')}</p>
      )}
    </div>
  )
}
