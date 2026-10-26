import type { IsoDateTime } from './common'
import type { Rol } from '@/lib/constants'

// Logistica.Abstracciones/DTOs/AuthDTO.cs
export interface LoginDTO {
  nombreUsuario: string
  password: string
}

export interface LoginRespuestaDTO {
  token: string
  // UTC (termina en "Z")
  expira: IsoDateTime
  idUsuario: number
  nombreUsuario: string
  rol: Rol
}
