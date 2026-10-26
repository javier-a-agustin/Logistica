import { cn } from '@/lib/cn'

// Estilo común de input/select/textarea
export const controlClass = (invalid: boolean) =>
  cn(
    'block w-full rounded-md border bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors',
    'placeholder:text-slate-400 focus:outline-2 focus:outline-offset-0',
    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
    invalid ? 'border-red-400 focus:outline-red-500' : 'border-slate-300 focus:outline-brand-500',
  )
