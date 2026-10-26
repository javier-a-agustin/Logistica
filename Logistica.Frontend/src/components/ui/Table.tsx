import type { Key, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  // Oculta la columna en pantallas chicas
  hideOnMobile?: boolean
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => Key
  className?: string
}

export function Table<T>({ columns, rows, rowKey, className }: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  'px-4 py-2.5 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase',
                  column.hideOnMobile && 'hidden md:table-cell',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50/60">
              {columns.map((column, i) => (
                <td
                  key={i}
                  className={cn(
                    'px-4 py-2.5 align-middle text-slate-700',
                    column.hideOnMobile && 'hidden md:table-cell',
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
