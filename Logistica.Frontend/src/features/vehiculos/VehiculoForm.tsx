import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ErrorAlert } from '@/components/ui/States'
import { useMarcas, useModelos } from '@/hooks/useCatalogos'
import { useSaveVehiculo } from '@/hooks/useVehiculos'
import { applyApiFieldErrors, numberInRange, requiredId, requiredText } from '@/lib/forms'
import type { VehiculoDTO } from '@/types'

// VehiculoGuardarDTO. idMarca es solo de la UI (filtra los modelos)
const vehiculoSchema = z.object({
  patente: requiredText(10).transform((value) => value.replace(/\s+/g, '').toUpperCase()),
  idMarca: requiredId('Seleccioná una marca'),
  idModelo: requiredId('Seleccioná un modelo'),
  capacidadKg: numberInRange(0.01, 100000),
  activo: z.boolean(),
})

type VehiculoFormInput = z.input<typeof vehiculoSchema>
type VehiculoFormOutput = z.output<typeof vehiculoSchema>

const fields = ['patente', 'idMarca', 'idModelo', 'capacidadKg', 'activo'] as const

interface VehiculoFormProps {
  vehiculo?: VehiculoDTO
  onDone: () => void
}

export function VehiculoForm({ vehiculo, onDone }: VehiculoFormProps) {
  const save = useSaveVehiculo()
  const marcas = useMarcas()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<VehiculoFormInput, unknown, VehiculoFormOutput>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      patente: vehiculo?.patente ?? '',
      idMarca: vehiculo?.idMarca ?? '',
      idModelo: vehiculo?.idModelo ?? '',
      capacidadKg: vehiculo?.capacidadKg ?? '',
      activo: vehiculo?.activo ?? true,
    },
  })

  const idMarca = Number(useWatch({ control, name: 'idMarca' })) || undefined
  const idModelo = useWatch({ control, name: 'idModelo' })
  const idMarcaElegida = useWatch({ control, name: 'idMarca' })
  const modelos = useModelos(idMarca, { enabled: !!idMarca })

  const onSubmit = handleSubmit(({ patente, idModelo, capacidadKg, activo }) => {
    save.mutate(
      { id: vehiculo?.idVehiculo, vehiculo: { patente, idModelo, capacidadKg, activo } },
      { onSuccess: onDone, onError: (error) => applyApiFieldErrors(error, setError, fields) },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Patente"
          required
          maxLength={10}
          autoCapitalize="characters"
          className="font-mono uppercase"
          error={errors.patente?.message}
          {...register('patente')}
        />
        <Input
          label="Capacidad (kg)"
          required
          type="number"
          step="0.01"
          min={0.01}
          inputMode="decimal"
          error={errors.capacidadKg?.message}
          {...register('capacidadKg')}
        />
        <Select
          label="Marca"
          required
          placeholder={marcas.isPending ? 'Cargando…' : 'Seleccioná…'}
          error={errors.idMarca?.message ?? (marcas.isError ? 'No se pudieron cargar las marcas' : undefined)}
          {...register('idMarca', { onChange: () => setValue('idModelo', '') })}
          value={String(idMarcaElegida ?? '')}
        >
          {marcas.data?.map((m) => (
            <option key={m.idMarca} value={m.idMarca}>
              {m.nombreMarca}
            </option>
          ))}
        </Select>
        <Select
          label="Modelo"
          required
          placeholder={!idMarca ? 'Elegí primero la marca' : modelos.isPending ? 'Cargando…' : 'Seleccioná…'}
          disabled={!idMarca || modelos.isPending}
          error={errors.idModelo?.message}
          {...register('idModelo')}
          value={String(idModelo ?? '')}
        >
          {modelos.data?.map((m) => (
            <option key={m.idModelo} value={m.idModelo}>
              {m.nombreModelo}
            </option>
          ))}
        </Select>
      </div>
      <Checkbox label="Activo" {...register('activo')} />

      <ErrorAlert error={save.error} knownFields={fields} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={save.isPending}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          {vehiculo ? 'Guardar cambios' : 'Crear vehículo'}
        </Button>
      </div>
    </form>
  )
}
