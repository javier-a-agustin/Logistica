import type { ChoferDTO, ChoferGuardarDTO } from '@/types'
import { api } from './client'

// ChoferController
export const choferesApi = {
  list: (soloActivos = false) => api.get<ChoferDTO[]>('/Chofer', { query: { soloActivos } }),
  get: (id: number) => api.get<ChoferDTO>(`/Chofer/${id}`),
  habilitados: () => api.get<ChoferDTO[]>('/Chofer/Habilitados'),
  create: (chofer: ChoferGuardarDTO) => api.post<ChoferDTO>('/Chofer', chofer),
  update: (id: number, chofer: ChoferGuardarDTO) => api.put<ChoferDTO>(`/Chofer/${id}`, chofer),
  // Baja lógica
  remove: (id: number) => api.delete(`/Chofer/${id}`),
}
