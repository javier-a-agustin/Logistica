import { z } from 'zod'
import { numberInRange, optionalText, requiredId, requiredText } from '@/lib/forms'
import type { ClienteGuardarDTO } from '@/types'

// ClienteGuardarDTO. idProvincia es solo de la UI (para filtrar localidades)
export const clienteSchema = z.object({
  razonSocialNombre: requiredText(100),
  apellido: optionalText(100),
  tipoDocumento: requiredText(10).transform((value) => value.toUpperCase()),
  numeroDocumento: requiredText(20),
  telefono: optionalText(30),
  calle: requiredText(100),
  altura: numberInRange(1, 99999, { integer: true }),
  pisoDepto: optionalText(20),
  idProvincia: requiredId('Seleccioná una provincia'),
  idLocalidad: requiredId('Seleccioná una localidad'),
  // [EmailAddress, MaxLength(100)]
  email: z
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'Email inválido')
    .transform((value) => value || null),
})

export type ClienteFormInput = z.input<typeof clienteSchema>
export type ClienteFormOutput = z.output<typeof clienteSchema>

export const clienteFields = [
  'razonSocialNombre',
  'apellido',
  'tipoDocumento',
  'numeroDocumento',
  'telefono',
  'calle',
  'altura',
  'pisoDepto',
  'idProvincia',
  'idLocalidad',
  'email',
] as const satisfies readonly (keyof ClienteFormInput)[]

export function toClienteGuardarDTO(values: ClienteFormOutput): ClienteGuardarDTO {
  return {
    razonSocialNombre: values.razonSocialNombre,
    apellido: values.apellido,
    tipoDocumento: values.tipoDocumento,
    numeroDocumento: values.numeroDocumento,
    telefono: values.telefono,
    calle: values.calle,
    altura: values.altura,
    pisoDepto: values.pisoDepto,
    idLocalidad: values.idLocalidad,
    email: values.email,
  }
}
