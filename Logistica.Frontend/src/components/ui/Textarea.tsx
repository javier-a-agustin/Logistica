import { useId, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { controlClass } from './controlClass'
import { Field } from './Field'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  error?: string
  hint?: ReactNode
  containerClassName?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ label, error, hint, containerClassName, className, id, required, ...props }: TextareaProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Field id={inputId} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <textarea
        id={inputId}
        rows={3}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(controlClass(!!error), 'py-2', className)}
        {...props}
      />
    </Field>
  )
}
