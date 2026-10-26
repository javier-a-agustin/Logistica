import type { IsoDateTime } from './common'

// Logistica.Abstracciones/DTOs/PaqueteDTO.cs
export interface PaqueteDTO {
  idPaquete: number
  codigoSeguimiento: string
  idClienteRem: number
  remitente: string
  idClienteDest: number
  destinatario: string
  idUsuarioRecepcion: number
  usuarioRecepcion: string
  descripcion: string | null
  pesoKg: number
  altoCm: number
  anchoCm: number
  largoCm: number
  idEstadoActual: number
  estadoActual: string
  fechaIngreso: IsoDateTime
}

export interface PaqueteCrearDTO {
  idClienteRem: number
  idClienteDest: number
  descripcion: string | null
  pesoKg: number
  altoCm: number
  anchoCm: number
  largoCm: number
}

export interface HistorialPaqueteDTO {
  idHistorial: number
  idEstadoPaquete: number
  estado: string
  idUsuario: number
  usuario: string
  fechaHora: IsoDateTime
  observacion: string | null
}

export interface SeguimientoDTO {
  paquete: PaqueteDTO
  historial: HistorialPaqueteDTO[]
}
