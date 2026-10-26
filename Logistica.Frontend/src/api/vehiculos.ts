import type { VehiculoDTO, VehiculoGuardarDTO } from '@/types'
import { api } from './client'

// VehiculoController
export const vehiculosApi = {
  list: (soloActivos = false) => api.get<VehiculoDTO[]>('/Vehiculo', { query: { soloActivos } }),
  get: (id: number) => api.get<VehiculoDTO>(`/Vehiculo/${id}`),
  disponibles: () => api.get<VehiculoDTO[]>('/Vehiculo/Disponibles'),
  create: (vehiculo: VehiculoGuardarDTO) => api.post<VehiculoDTO>('/Vehiculo', vehiculo),
  update: (id: number, vehiculo: VehiculoGuardarDTO) => api.put<VehiculoDTO>(`/Vehiculo/${id}`, vehiculo),
  // Baja lógica
  remove: (id: number) => api.delete(`/Vehiculo/${id}`),
}
