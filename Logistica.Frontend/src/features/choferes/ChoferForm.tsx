import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ErrorAlert } from '@/components/ui/States'
import { useChoferes, useSaveChofer } from '@/hooks/useChoferes'
import { useUsuarios } from '@/hooks/useUsuarios'
import { Roles } from '@/lib/constants'
import { applyApiFieldErrors, optionalDate, optionalText, requiredId, requiredText } from '@/lib/forms'
import type { ChoferDTO } from '@/types'

// ChoferGuardarDTO + regla del backend: con licencia hay que indicar el vencimiento
const choferSchema = z
  .object({
    idUsuario: requiredId('Seleccioná el usuario con el que ingresa el chofer'),
    nombre: requiredText(50),
    apellido: requiredText(50),
    dni: requiredText(15),
    licenciaConducir: z.boolean(),
    fechaVencimientoLicencia: optionalDate(),
    telefono: optionalText(30),
    activo: z.boolean(),
  })
  .refine((c) => !c.licenciaConducir || !!c.fechaVencimientoLicencia, {
    message: 'Indicá la fecha de vencimiento de la licencia',
    path: ['fechaVencimientoLicencia'],
  })

type ChoferFormInput = z.input<typeof choferSchema>
type ChoferFormOutput = z.output<typeof choferSchema>

const fields = ['idUsuario', 'nombre', 'apellido', 'dni', 'licenciaConducir', 'fechaVencimientoLicencia', 'telefono', 'activo'] as const

interface ChoferFormProps {
  chofer?: ChoferDTO
  onDone: () => void
}

export function ChoferForm({ chofer, onDone }: ChoferFormProps) {
  const save = useSaveChofer()
  const usuarios = useUsuarios()
  const choferes = useChoferes(false)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<ChoferFormInput, unknown, ChoferFormOutput>({
    resolver: zodResolver(choferSchema),
    defaultValues: {
      idUsuario: chofer?.idUsuario ?? '',
      nombre: chofer?.nombre ?? '',
      apellido: chofer?.apellido ?? '',
      dni: chofer?.dni ?? '',
      licenciaConducir: chofer?.licenciaConducir ?? true,
      fechaVencimientoLicencia: chofer?.fechaVencimientoLicencia ?? '',
      telefono: chofer?.telefono ?? '',
      activo: chofer?.activo ?? true,
    },
  })

  const conLicencia = useWatch({ control, name: 'licenciaConducir' })
  const idUsuario = useWatch({ control, name: 'idUsuario' })

  // Solo usuarios con rol Chofer que no estén asociados a otro chofer
  const asociados = new Set(choferes.data?.filter((c) => c.idChofer !== chofer?.idChofer).map((c) => c.idUsuario))
  const opciones = usuarios.data?.filter((u) => u.nombreRol === Roles.Chofer && !asociados.has(u.idUsuario)) ?? []

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { id: chofer?.idChofer, chofer: values },
      { onSuccess: onDone, onError: (error) => applyApiFieldErrors(error, setError, fields) },
    )
  })

  const cargandoUsuarios = usuarios.isPending || choferes.isPending

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Usuario del sistema"
          required
          placeholder={cargandoUsuarios ? 'Cargando…' : opciones.length ? 'Seleccioná…' : 'No hay usuarios Chofer libres'}
          disabled={cargandoUsuarios}
          hint="Usuario con rol Chofer con el que ingresa a la app"
          error={errors.idUsuario?.message ?? (usuarios.isError ? 'No se pudieron cargar los usuarios' : undefined)}
          containerClassName="sm:col-span-2"
          {...register('idUsuario')}
          value={String(idUsuario ?? '')}
        >
          {opciones.map((u) => (
            <option key={u.idUsuario} value={u.idUsuario}>
              {u.nombreUsuario}
              {u.activo ? '' : ' (inactivo)'}
            </option>
          ))}
        </Select>
        <Input label="Nombre" required error={errors.nombre?.message} {...register('nombre')} />
        <Input label="Apellido" required error={errors.apellido?.message} {...register('apellido')} />
        <Input label="DNI" required inputMode="numeric" error={errors.dni?.message} {...register('dni')} />
        <Input label="Teléfono" type="tel" error={errors.telefono?.message} {...register('telefono')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <Checkbox label="Tiene licencia de conducir" className="sm:mb-2.5" {...register('licenciaConducir')} />
        <Input
          label="Vencimiento de la licencia"
          type="date"
          required={!!conLicencia}
          disabled={!conLicencia}
          error={errors.fechaVencimientoLicencia?.message}
          {...register('fechaVencimientoLicencia')}
        />
      </div>
      <Checkbox label="Activo" {...register('activo')} />

      <ErrorAlert error={save.error} knownFields={fields} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={save.isPending}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          {chofer ? 'Guardar cambios' : 'Crear chofer'}
        </Button>
      </div>
    </form>
  )
}
