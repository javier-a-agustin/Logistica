import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '@/lib/cn'
import { controlClass } from './controlClass'
import { Field } from './Field'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string
  hint?: ReactNode
  containerClassName?: string
  ref?: Ref<HTMLInputElement>
}

export function Input({ label, error, hint, containerClassName, className, id, required, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Field id={inputId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(controlClass(!!error), 'h-10', className)}
        {...props}
      />
    </Field>
  )
}
