import { useId, type ReactNode, type Ref, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { controlClass } from './controlClass'
import { Field } from './Field'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  error?: string
  hint?: ReactNode
  // Primera opción con value=""
  placeholder?: string
  containerClassName?: string
  ref?: Ref<HTMLSelectElement>
}

export function Select({
  label,
  error,
  hint,
  placeholder,
  containerClassName,
  className,
  id,
  required,
  children,
  ...props
}: SelectProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Field id={inputId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <select
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(controlClass(!!error), 'h-10 pr-8', className)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {children}
      </select>
    </Field>
  )
}
