import type { ClienteDTO, ClienteGuardarDTO } from '@/types'
import { api, seg } from './client'

// ClienteController
export const clientesApi = {
  list: (busqueda?: string) => api.get<ClienteDTO[]>('/Cliente', { query: { busqueda } }),
  get: (id: number) => api.get<ClienteDTO>(`/Cliente/${id}`),
  // 404 = el cliente no está registrado
  getByDocumento: (tipoDocumento: string, numeroDocumento: string) =>
    api.get<ClienteDTO>(`/Cliente/Documento/${seg(tipoDocumento)}/${seg(numeroDocumento)}`),
  create: (cliente: ClienteGuardarDTO) => api.post<ClienteDTO>('/Cliente', cliente),
  update: (id: number, cliente: ClienteGuardarDTO) => api.put<ClienteDTO>(`/Cliente/${id}`, cliente),
  remove: (id: number) => api.delete(`/Cliente/${id}`),
}
