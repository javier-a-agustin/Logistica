import type {
  ActualizarEstadoPaqueteDTO,
  DisponiblesDespachoDTO,
  HojaRutaDTO,
  HojaRutaItemDTO,
  ViajeCrearDTO,
  ViajeDTO,
} from '@/types'
import { api } from './client'

// ViajeController
export const viajesApi = {
  disponibles: () => api.get<DisponiblesDespachoDTO>('/Viaje/Disponibles'),
  list: (idEstado?: number) => api.get<ViajeDTO[]>('/Viaje', { query: { idEstado } }),
  hojaRuta: (id: number) => api.get<HojaRutaDTO>(`/Viaje/${id}/HojaRuta`),
  create: (viaje: ViajeCrearDTO) => api.post<HojaRutaDTO>('/Viaje', viaje),
  misViajes: () => api.get<HojaRutaDTO[]>('/Viaje/MisViajes'),
  updateEstadoPaquete: (id: number, idPaquete: number, estado: ActualizarEstadoPaqueteDTO) =>
    api.put<HojaRutaItemDTO>(`/Viaje/${id}/Paquete/${idPaquete}/Estado`, estado),
  finalizar: (id: number) => api.put<HojaRutaDTO>(`/Viaje/${id}/Finalizar`),
}
