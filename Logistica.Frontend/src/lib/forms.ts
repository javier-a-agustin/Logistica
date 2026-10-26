import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { isApiError } from '@/api/client'

// Pasa los errores de validación del backend (ValidationProblemDetails) a los campos del formulario
export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
) {
  if (!isApiError(error) || !error.fieldErrors) return
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    if ((fields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message: messages.join(' ') })
    }
  }
}

// ---- Constructores de esquemas que reflejan los atributos [Required], [MaxLength] y [Range] de los DTOs ----

const maxMsg = (max: number) => `Máximo ${max} caracteres`

// [Required, MaxLength(n)]
export const requiredText = (max: number) =>
  z.string().trim().min(1, 'Este campo es obligatorio').max(max, maxMsg(max))

// [MaxLength(n)] opcional: "" se envía como null
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, maxMsg(max))
    .transform((value) => value || null)

// [Range(min, max)] sobre decimal / int, desde un <input type="number">
export const numberInRange = (min: number, max: number, options: { integer?: boolean } = {}) => {
  let schema = z.coerce
    .number({ error: 'Ingresá un número válido' })
    .min(min, `Debe ser mayor o igual a ${min}`)
    .max(max, `Debe ser menor o igual a ${max}`)
  if (options.integer) schema = schema.int('Debe ser un número entero')
  return schema
}

// [Range(1, int.MaxValue)] sobre un Id elegido en un <select> (value "" = sin elegir)
export const requiredId = (message: string) => z.coerce.number().int().min(1, message)

// DateOnly opcional desde <input type="date"> (un input deshabilitado llega como undefined)
export const optionalDate = () =>
  z
    .string()
    .optional()
    .transform((value) => value || null)
