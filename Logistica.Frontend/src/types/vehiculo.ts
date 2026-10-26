// Logistica.Abstracciones/DTOs/VehiculoDTO.cs
export interface VehiculoDTO {
  idVehiculo: number
  patente: string
  idModelo: number
  nombreModelo: string
  idMarca: number
  nombreMarca: string
  capacidadKg: number
  activo: boolean
}

export interface VehiculoGuardarDTO {
  patente: string
  idModelo: number
  capacidadKg: number
  activo: boolean
}
