import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ErrorAlert, ErrorState, LoadingState } from '@/components/ui/States'
import { useLocalidades, useProvincias } from '@/hooks/useCatalogos'
import { useSaveCliente } from '@/hooks/useClientes'
import { TiposDocumento } from '@/lib/constants'
import { applyApiFieldErrors } from '@/lib/forms'
import type { ClienteDTO, ProvinciaDTO } from '@/types'
import { clienteFields, clienteSchema, toClienteGuardarDTO, type ClienteFormInput, type ClienteFormOutput } from './schema'

interface ClienteFormProps {
  // Si viene, se edita; si no, se crea
  cliente?: ClienteDTO
  // Valores iniciales al crear (ej: documento ya buscado en Recepción)
  initial?: Partial<Pick<ClienteDTO, 'tipoDocumento' | 'numeroDocumento'>>
  onSaved: (cliente: ClienteDTO) => void
  onCancel?: () => void
  submitLabel?: string
}

// Alta / edición de cliente. Espera a tener las provincias para poder precargar la provincia del cliente
export function ClienteForm(props: ClienteFormProps) {
  const provincias = useProvincias()
  if (provincias.isPending) return <LoadingState />
  if (provincias.isError) return <ErrorState error={provincias.error} onRetry={() => void provincias.refetch()} />
  return <ClienteFormFields {...props} provincias={provincias.data} />
}

function ClienteFormFields({
  cliente,
  initial,
  onSaved,
  onCancel,
  submitLabel,
  provincias,
}: ClienteFormProps & { provincias: ProvinciaDTO[] }) {
  const save = useSaveCliente()

  // ClienteDTO trae el nombre de la provincia pero no su Id
  const idProvincia = cliente ? provincias.find((p) => p.nombreProvincia === cliente.nombreProvincia)?.idProvincia : undefined

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClienteFormInput, unknown, ClienteFormOutput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      razonSocialNombre: cliente?.razonSocialNombre ?? '',
      apellido: cliente?.apellido ?? '',
      tipoDocumento: cliente?.tipoDocumento ?? initial?.tipoDocumento ?? 'DNI',
      numeroDocumento: cliente?.numeroDocumento ?? initial?.numeroDocumento ?? '',
      telefono: cliente?.telefono ?? '',
      calle: cliente?.calle ?? '',
      altura: cliente?.altura ?? '',
      pisoDepto: cliente?.pisoDepto ?? '',
      idProvincia: idProvincia ?? '',
      idLocalidad: idProvincia ? cliente?.idLocalidad : '',
      email: cliente?.email ?? '',
    },
  })

  const provinciaElegida = Number(useWatch({ control, name: 'idProvincia' })) || undefined
  // Controlado: las opciones llegan después que el valor inicial
  const localidadElegida = useWatch({ control, name: 'idLocalidad' })
  const localidades = useLocalidades(provinciaElegida)

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { id: cliente?.idCliente, cliente: toClienteGuardarDTO(values) },
      {
        onSuccess: onSaved,
        onError: (error) => applyApiFieldErrors(error, setError, clienteFields),
      },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre o razón social"
          required
          error={errors.razonSocialNombre?.message}
          {...register('razonSocialNombre')}
        />
        <Input label="Apellido" hint="Vacío para personas jurídicas" error={errors.apellido?.message} {...register('apellido')} />

        <Select label="Tipo de documento" required error={errors.tipoDocumento?.message} {...register('tipoDocumento')}>
          {TiposDocumento.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </Select>
        <Input
          label="Número de documento"
          required
          inputMode="numeric"
          error={errors.numeroDocumento?.message}
          {...register('numeroDocumento')}
        />

        <Input label="Calle" required error={errors.calle?.message} containerClassName="sm:col-span-2" {...register('calle')} />
        <Input label="Altura" required type="number" inputMode="numeric" min={1} max={99999} error={errors.altura?.message} {...register('altura')} />
        <Input label="Piso / depto." error={errors.pisoDepto?.message} {...register('pisoDepto')} />

        <Select
          label="Provincia"
          required
          placeholder="Seleccioná…"
          error={errors.idProvincia?.message}
          {...register('idProvincia', { onChange: () => setValue('idLocalidad', '') })}
        >
          {provincias.map((p) => (
            <option key={p.idProvincia} value={p.idProvincia}>
              {p.nombreProvincia}
            </option>
          ))}
        </Select>
        <Select
          label="Localidad"
          required
          placeholder={!provinciaElegida ? 'Elegí primero la provincia' : localidades.isPending ? 'Cargando…' : 'Seleccioná…'}
          disabled={!provinciaElegida || localidades.isPending}
          error={errors.idLocalidad?.message ?? (localidades.isError ? 'No se pudieron cargar las localidades' : undefined)}
          {...register('idLocalidad')}
          value={String(localidadElegida ?? '')}
        >
          {localidades.data?.map((l) => (
            <option key={l.idLocalidad} value={l.idLocalidad}>
              {l.nombreLocalidad} ({l.codigoPostal})
            </option>
          ))}
        </Select>

        <Input label="Teléfono" type="tel" error={errors.telefono?.message} {...register('telefono')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      </div>

      <ErrorAlert error={save.error} knownFields={clienteFields} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={save.isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={save.isPending}>
          {submitLabel ?? (cliente ? 'Guardar cambios' : 'Registrar cliente')}
        </Button>
      </div>
    </form>
  )
}
