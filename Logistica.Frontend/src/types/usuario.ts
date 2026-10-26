// Logistica.Abstracciones/DTOs/UsuarioDTO.cs
// (UsuarioCredencialDTO es interno del backend y nunca llega al cliente)
export interface UsuarioDTO {
  idUsuario: number
  nombreUsuario: string
  idRol: number
  nombreRol: string
  activo: boolean
}

export interface UsuarioCrearDTO {
  nombreUsuario: string
  password: string
  idRol: number
}

export interface UsuarioActualizarDTO {
  idRol: number
  activo: boolean
}

export interface CambiarPasswordDTO {
  passwordNueva: string
}
