import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface FieldProps {
  id: string
  label?: ReactNode
  error?: string
  hint?: ReactNode
  required?: boolean
  className?: string
  children: ReactNode
}

// Etiqueta + control + mensaje de error/ayuda
export function Field({ id, label, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}
