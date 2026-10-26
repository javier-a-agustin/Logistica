// Espejo de Logistica.Abstracciones/Comun/Constantes.cs

export const Roles = {
  Recepcionista: 'Recepcionista',
  Despachante: 'Despachante',
  Chofer: 'Chofer',
  Gerente: 'Gerente',
} as const

export type Rol = (typeof Roles)[keyof typeof Roles]

export const EstadosPaquete = {
  EnDeposito: 1,
  EnTransito: 2,
  Entregado: 3,
  Cancelado: 4,
} as const

export const EstadosViaje = {
  Programado: 1,
  EnCurso: 2,
  Finalizado: 3,
  Cancelado: 4,
} as const

// Nombres por defecto (los oficiales vienen de /Catalogo/EstadosPaquete y /Catalogo/EstadosViaje)
export const nombreEstadoPaquete: Record<number, string> = {
  [EstadosPaquete.EnDeposito]: 'En depósito',
  [EstadosPaquete.EnTransito]: 'En tránsito',
  [EstadosPaquete.Entregado]: 'Entregado',
  [EstadosPaquete.Cancelado]: 'Cancelado',
}

export const nombreEstadoViaje: Record<number, string> = {
  [EstadosViaje.Programado]: 'Programado',
  [EstadosViaje.EnCurso]: 'En curso',
  [EstadosViaje.Finalizado]: 'Finalizado',
  [EstadosViaje.Cancelado]: 'Cancelado',
}

// Comentario de ClienteGuardarDTO.TipoDocumento
export const TiposDocumento = ['DNI', 'CUIT', 'CUIL', 'PAS'] as const
