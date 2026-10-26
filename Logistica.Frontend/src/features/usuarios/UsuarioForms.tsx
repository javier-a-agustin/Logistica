import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ErrorAlert } from '@/components/ui/States'
import { useRoles } from '@/hooks/useCatalogos'
import { useChangePassword, useCreateUsuario, useUpdateUsuario } from '@/hooks/useUsuarios'
import { applyApiFieldErrors, requiredId, requiredText } from '@/lib/forms'
import type { UsuarioDTO } from '@/types'

// [Required, MinLength(6), MaxLength(100)]
const password = z.string().min(6, 'Mínimo 6 caracteres').max(100, 'Máximo 100 caracteres')

// El <select> se registra recién cuando llegan los roles, así react-hook-form puede marcar el valor inicial
function RolSelect(props: ComponentProps<typeof Select>) {
  const roles = useRoles()
  if (!roles.data) {
    return (
      <Select
        label="Rol"
        required
        disabled
        placeholder={roles.isError ? 'No se pudieron cargar los roles' : 'Cargando…'}
        error={props.error}
      />
    )
  }
  return (
    <Select label="Rol" required placeholder="Seleccioná…" {...props}>
      {roles.data?.map((r) => (
        <option key={r.idRol} value={r.idRol}>
          {r.nombreRol}
        </option>
      ))}
    </Select>
  )
}

function Acciones({ loading, label, onCancel }: { loading: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" loading={loading}>
        {label}
      </Button>
    </div>
  )
}

// ---- Alta (UsuarioCrearDTO) ----

const crearSchema = z
  .object({
    nombreUsuario: requiredText(50),
    password,
    confirmacion: z.string(),
    idRol: requiredId('Seleccioná un rol'),
  })
  .refine((u) => u.password === u.confirmacion, { message: 'Las contraseñas no coinciden', path: ['confirmacion'] })

const crearFields = ['nombreUsuario', 'password', 'idRol'] as const

export function CrearUsuarioForm({ onDone }: { onDone: () => void }) {
  const crear = useCreateUsuario()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.input<typeof crearSchema>, unknown, z.output<typeof crearSchema>>({
    resolver: zodResolver(crearSchema),
    defaultValues: { nombreUsuario: '', password: '', confirmacion: '', idRol: '' },
  })

  const onSubmit = handleSubmit(({ nombreUsuario, password, idRol }) => {
    crear.mutate({ nombreUsuario, password, idRol }, { onSuccess: onDone, onError: (error) => applyApiFieldErrors(error, setError, crearFields) })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input label="Nombre de usuario" required autoComplete="off" autoCapitalize="none" error={errors.nombreUsuario?.message} {...register('nombreUsuario')} />
      <RolSelect error={errors.idRol?.message} {...register('idRol')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Contraseña" required type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input label="Repetir contraseña" required type="password" autoComplete="new-password" error={errors.confirmacion?.message} {...register('confirmacion')} />
      </div>
      <ErrorAlert error={crear.error} knownFields={crearFields} />
      <Acciones loading={crear.isPending} label="Crear usuario" onCancel={onDone} />
    </form>
  )
}

// ---- Edición de rol / estado (UsuarioActualizarDTO) ----

const editarSchema = z.object({
  idRol: requiredId('Seleccioná un rol'),
  activo: z.boolean(),
})

const editarFields = ['idRol', 'activo'] as const

export function EditarUsuarioForm({ usuario, esUsuarioActual, onDone }: { usuario: UsuarioDTO; esUsuarioActual: boolean; onDone: () => void }) {
  const actualizar = useUpdateUsuario()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.input<typeof editarSchema>, unknown, z.output<typeof editarSchema>>({
    resolver: zodResolver(editarSchema),
    defaultValues: { idRol: usuario.idRol, activo: usuario.activo },
  })

  const onSubmit = handleSubmit((values) => {
    actualizar.mutate(
      { id: usuario.idUsuario, usuario: values },
      { onSuccess: onDone, onError: (error) => applyApiFieldErrors(error, setError, editarFields) },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <RolSelect error={errors.idRol?.message} {...register('idRol')} />
      <Checkbox label="Usuario activo (puede iniciar sesión)" {...register('activo')} />
      {esUsuarioActual && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Estás editando tu propio usuario: si te quitás el rol Gerente o te desactivás vas a perder el acceso.
        </p>
      )}
      <ErrorAlert error={actualizar.error} knownFields={editarFields} />
      <Acciones loading={actualizar.isPending} label="Guardar cambios" onCancel={onDone} />
    </form>
  )
}

// ---- Cambio de contraseña (CambiarPasswordDTO) ----

const passwordSchema = z
  .object({ passwordNueva: password, confirmacion: z.string() })
  .refine((p) => p.passwordNueva === p.confirmacion, { message: 'Las contraseñas no coinciden', path: ['confirmacion'] })

const passwordFields = ['passwordNueva'] as const

export function CambiarPasswordForm({ usuario, onDone }: { usuario: UsuarioDTO; onDone: () => void }) {
  const cambiar = useChangePassword()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordNueva: '', confirmacion: '' },
  })

  const onSubmit = handleSubmit(({ passwordNueva }) => {
    cambiar.mutate(
      { id: usuario.idUsuario, cambio: { passwordNueva } },
      { onSuccess: onDone, onError: (error) => applyApiFieldErrors(error, setError, passwordFields) },
    )
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Input label="Nueva contraseña" required type="password" autoComplete="new-password" error={errors.passwordNueva?.message} {...register('passwordNueva')} />
      <Input label="Repetir contraseña" required type="password" autoComplete="new-password" error={errors.confirmacion?.message} {...register('confirmacion')} />
      <ErrorAlert error={cambiar.error} knownFields={passwordFields} />
      <Acciones loading={cambiar.isPending} label="Cambiar contraseña" onCancel={onDone} />
    </form>
  )
}
