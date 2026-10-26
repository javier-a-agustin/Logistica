import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { isApiError } from '@/api/client'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/errors'
import { Button } from './Button'
import { Spinner } from './Spinner'

export function LoadingState({ label = 'Cargando…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 px-4 py-12 text-sm text-slate-500', className)} role="status">
      <Spinner />
      {label}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-12 text-center', className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400" aria-hidden="true">
        ∅
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-12 text-center', className)} role="alert">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-500" aria-hidden="true">
        !
      </div>
      <p className="font-medium text-slate-700">No se pudo cargar la información</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

interface ErrorAlertProps {
  error: unknown
  // Campos que el formulario ya muestra junto al control: no se repiten acá
  knownFields?: readonly string[]
  className?: string
}

// Error de una mutación: mensaje del backend + errores de validación que no corresponden a un campo visible
export function ErrorAlert({ error, knownFields = [], className }: ErrorAlertProps) {
  if (!error) return null
  const extra =
    isApiError(error) && error.fieldErrors
      ? Object.entries(error.fieldErrors)
          .filter(([field]) => !knownFields.includes(field))
          .flatMap(([, messages]) => messages)
      : []

  return (
    <div role="alert" className={cn('rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700', className)}>
      <p className="font-medium">{errorMessage(error)}</p>
      {extra.length > 0 && (
        <ul className="mt-1 list-disc pl-5">
          {extra.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface QueryStateProps<T> {
  query: UseQueryResult<T>
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  loadingLabel?: string
  children: (data: T) => ReactNode
}

// Estados de carga / error / vacío comunes a todos los listados
export function QueryState<T>({ query, isEmpty, empty, loadingLabel, children }: QueryStateProps<T>) {
  if (query.isPending) return <LoadingState label={loadingLabel} />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState title="No hay datos para mostrar" />}</>
  return <>{children(query.data)}</>
}
