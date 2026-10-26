import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, type Location } from 'react-router'
import { z } from 'zod'
import { sessionStore } from '@/auth/session'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/components/layout/Icon'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ErrorAlert } from '@/components/ui/States'
import { canAccess, homeByRole } from '@/lib/navigation'

// LoginDTO: [Required] NombreUsuario, [Required] Password
const loginSchema = z.object({
  nombreUsuario: z.string().trim().min(1, 'Ingresá tu usuario'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

const avisos = {
  expired: 'Tu sesión expiró. Volvé a iniciar sesión.',
  unauthorized: 'Tu sesión ya no es válida. Volvé a iniciar sesión.',
}

export function LoginPage() {
  const { session, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from
  const [error, setError] = useState<unknown>(null)
  const [motivo] = useState(() => sessionStore.getLogoutReason())

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { nombreUsuario: '', password: '' } })

  // Con sesión: vuelve a la pantalla que pidió el login si el rol puede verla; si no, a la pantalla inicial del rol
  if (session) {
    const volver = from && from.pathname !== '/' && canAccess(from.pathname, session.rol)
    return <Navigate to={volver ? from.pathname + from.search : homeByRole[session.rol]} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await login(values)
    } catch (e) {
      setError(e)
    }
  })

  const aviso = motivo === 'expired' || motivo === 'unauthorized' ? avisos[motivo] : null

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-800 to-brand-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-white/10">
            <Icon name="truck" className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold">Logística</h1>
          <p className="text-sm text-brand-200">Gestión de encomiendas</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {aviso && !error && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{aviso}</p>
              )}
              <Input
                label="Usuario"
                autoComplete="username"
                autoCapitalize="none"
                autoFocus
                error={errors.nombreUsuario?.message}
                {...register('nombreUsuario')}
              />
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <ErrorAlert error={error} knownFields={['nombreUsuario', 'password']} />
              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                Ingresar
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
