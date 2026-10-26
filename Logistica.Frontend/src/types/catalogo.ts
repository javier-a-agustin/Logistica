// Logistica.Abstracciones/DTOs/CatalogoDTO.cs
export interface ProvinciaDTO {
  idProvincia: number
  nombreProvincia: string
}

export interface LocalidadDTO {
  idLocalidad: number
  idProvincia: number
  nombreProvincia: string
  nombreLocalidad: string
  codigoPostal: string
}

export interface RolDTO {
  idRol: number
  nombreRol: string
  descripcion: string | null
}

export interface MarcaDTO {
  idMarca: number
  nombreMarca: string
}

export interface ModeloDTO {
  idModelo: number
  idMarca: number
  nombreMarca: string
  nombreModelo: string
}

// Sirve tanto para EstadosPaquete como para EstadosViaje
export interface EstadoDTO {
  id: number
  nombre: string
}

export interface MarcaCrearDTO {
  nombreMarca: string
}

export interface ModeloCrearDTO {
  idMarca: number
  nombreModelo: string
}
