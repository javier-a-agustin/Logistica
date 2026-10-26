import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from '@/lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <label htmlFor={inputId} className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700', className)}>
      <input id={inputId} type="checkbox" className="size-4 rounded border-slate-300 accent-brand-600" {...props} />
      {label}
    </label>
  )
}
