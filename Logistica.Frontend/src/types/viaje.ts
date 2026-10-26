import type { ChoferDTO } from './chofer'
import type { IsoDateTime } from './common'
import type { PaqueteDTO } from './paquete'
import type { VehiculoDTO } from './vehiculo'

// Logistica.Abstracciones/DTOs/ViajeDTO.cs
export interface ViajeDTO {
  idViaje: number
  idVehiculo: number
  patente: string
  idChofer: number
  chofer: string
  despachante: string
  fechaSalida: IsoDateTime
  fechaLlegadaEstimada: IsoDateTime | null
  idEstadoViaje: number
  estadoViaje: string
  cantidadPaquetes: number
  pesoTotalKg: number
}

export interface ViajeCrearDTO {
  idVehiculo: number
  idChofer: number
  // Si no se informa el backend usa la fecha/hora actual. Hora local, sin zona horaria
  fechaSalida?: IsoDateTime | null
  fechaLlegadaEstimada?: IsoDateTime | null
  paquetes: ViajePaqueteDTO[]
}

export interface ViajePaqueteDTO {
  idPaquete: number
  ordenEntrega: number
}

export interface HojaRutaDTO {
  idViaje: number
  idVehiculo: number
  patente: string
  vehiculo: string
  capacidadKg: number
  idChofer: number
  idUsuarioChofer: number
  chofer: string
  idUsuarioDespachante: number
  despachante: string
  fechaSalida: IsoDateTime
  fechaLlegadaEstimada: IsoDateTime | null
  idEstadoViaje: number
  estadoViaje: string
  pesoTotalKg: number
  entregas: HojaRutaItemDTO[]
}

export interface HojaRutaItemDTO {
  ordenEntrega: number
  idPaquete: number
  codigoSeguimiento: string
  descripcion: string | null
  pesoKg: number
  altoCm: number
  anchoCm: number
  largoCm: number
  idEstadoActual: number
  estadoActual: string
  destinatario: string
  telefonoDestinatario: string | null
  calle: string
  altura: number
  pisoDepto: string | null
  localidad: string
  codigoPostal: string
  provincia: string
}

export interface ActualizarEstadoPaqueteDTO {
  // Solo Entregado (3) o Cancelado (4)
  idEstadoPaquete: number
  // Obligatoria cuando el estado es Cancelado
  observacion: string | null
}

export interface DisponiblesDespachoDTO {
  paquetes: PaqueteDTO[]
  vehiculos: VehiculoDTO[]
  choferes: ChoferDTO[]
}
