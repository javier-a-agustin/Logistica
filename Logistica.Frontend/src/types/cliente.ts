// Logistica.Abstracciones/DTOs/ClienteDTO.cs
export interface ClienteDTO {
  idCliente: number
  razonSocialNombre: string
  apellido: string | null
  tipoDocumento: string
  numeroDocumento: string
  telefono: string | null
  calle: string
  altura: number
  pisoDepto: string | null
  idLocalidad: number
  nombreLocalidad: string
  codigoPostal: string
  nombreProvincia: string
  email: string | null
}

export interface ClienteGuardarDTO {
  razonSocialNombre: string
  apellido: string | null
  tipoDocumento: string
  numeroDocumento: string
  telefono: string | null
  calle: string
  altura: number
  pisoDepto: string | null
  idLocalidad: number
  email: string | null
}
