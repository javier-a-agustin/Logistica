import type { IsoDate } from './common'

// Logistica.Abstracciones/DTOs/ChoferDTO.cs
export interface ChoferDTO {
  idChofer: number
  idUsuario: number
  nombreUsuario: string
  usuarioActivo: boolean
  nombre: string
  apellido: string
  dni: string
  licenciaConducir: boolean
  fechaVencimientoLicencia: IsoDate | null
  telefono: string | null
  activo: boolean
}

export interface ChoferGuardarDTO {
  idUsuario: number
  nombre: string
  apellido: string
  dni: string
  licenciaConducir: boolean
  fechaVencimientoLicencia: IsoDate | null
  telefono: string | null
  activo: boolean
}
