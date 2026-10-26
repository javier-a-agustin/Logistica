import type { IsoDate, IsoDateTime } from '@/types'

const LOCALE = 'es-AR'

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'short' })
const dateFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short' })
const numberFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 })

// Las fechas del backend sin zona horaria se interpretan como hora local (igual que DateTime.Now en el servidor)
export function formatDateTime(value: IsoDateTime | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormat.format(date)
}

// DateOnly ("yyyy-MM-dd"): se arma la fecha local a mano para que no se corra un día por la zona horaria
export function formatDate(value: IsoDate | null | undefined): string {
  if (!value) return '—'
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return value
  return dateFormat.format(new Date(y, m - 1, d))
}

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatKg(value: number): string {
  return `${numberFormat.format(value)} kg`
}

export function formatCm(value: number): string {
  return `${numberFormat.format(value)} cm`
}

export function formatDimensiones(alto: number, ancho: number, largo: number): string {
  return `${numberFormat.format(alto)} × ${numberFormat.format(ancho)} × ${numberFormat.format(largo)} cm`
}

export function formatDireccion(calle: string, altura: number, pisoDepto?: string | null): string {
  return `${calle} ${altura}${pisoDepto ? `, ${pisoDepto}` : ''}`
}

export function nombreCompleto(nombre: string, apellido?: string | null): string {
  return apellido ? `${nombre} ${apellido}` : nombre
}

// Valor de un <input type="datetime-local"> -> DateTime local sin zona ("yyyy-MM-ddTHH:mm:ss")
export function datetimeLocalToApi(value: string): IsoDateTime | null {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

export function todayIsoDate(): IsoDate {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
