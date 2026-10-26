import type { CambiarPasswordDTO, UsuarioActualizarDTO, UsuarioCrearDTO, UsuarioDTO } from '@/types'
import { api } from './client'

// UsuarioController
export const usuariosApi = {
  list: () => api.get<UsuarioDTO[]>('/Usuario'),
  get: (id: number) => api.get<UsuarioDTO>(`/Usuario/${id}`),
  create: (usuario: UsuarioCrearDTO) => api.post<UsuarioDTO>('/Usuario', usuario),
  update: (id: number, usuario: UsuarioActualizarDTO) => api.put<UsuarioDTO>(`/Usuario/${id}`, usuario),
  changePassword: (id: number, cambio: CambiarPasswordDTO) => api.put<void>(`/Usuario/${id}/Password`, cambio),
}
