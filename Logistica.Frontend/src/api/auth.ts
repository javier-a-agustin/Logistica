import type { LoginDTO, LoginRespuestaDTO, UsuarioDTO } from '@/types'
import { api } from './client'

// AuthController
export const authApi = {
  login: (login: LoginDTO) => api.post<LoginRespuestaDTO>('/Auth/Login', login),
  me: () => api.get<UsuarioDTO>('/Auth/Me'),
}
