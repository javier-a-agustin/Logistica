import type { PaqueteCrearDTO, PaqueteDTO, SeguimientoDTO } from '@/types'
import { api, seg } from './client'

// PaqueteController
export const paquetesApi = {
  list: (idEstado?: number) => api.get<PaqueteDTO[]>('/Paquete', { query: { idEstado } }),
  get: (id: number) => api.get<PaqueteDTO>(`/Paquete/${id}`),
  seguimiento: (codigoSeguimiento: string) =>
    api.get<SeguimientoDTO>(`/Paquete/Seguimiento/${seg(codigoSeguimiento)}`),
  create: (paquete: PaqueteCrearDTO) => api.post<PaqueteDTO>('/Paquete', paquete),
}
