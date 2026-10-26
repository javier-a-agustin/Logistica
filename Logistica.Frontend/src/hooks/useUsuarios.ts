import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '@/api/usuarios'
import type { CambiarPasswordDTO, UsuarioActualizarDTO, UsuarioCrearDTO } from '@/types'
import { choferKeys } from './useChoferes'

export const usuarioKeys = {
  all: ['usuarios'] as const,
}

export function useUsuarios(options: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: usuarioKeys.all, queryFn: usuariosApi.list, enabled: options.enabled ?? true })
}

function useInvalidateUsuarios() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: usuarioKeys.all })
    // ChoferDTO incluye nombre y estado del usuario
    void queryClient.invalidateQueries({ queryKey: choferKeys.all })
  }
}

export function useCreateUsuario() {
  const invalidate = useInvalidateUsuarios()
  return useMutation({
    mutationFn: (usuario: UsuarioCrearDTO) => usuariosApi.create(usuario),
    onSuccess: invalidate,
  })
}

export function useUpdateUsuario() {
  const invalidate = useInvalidateUsuarios()
  return useMutation({
    mutationFn: ({ id, usuario }: { id: number; usuario: UsuarioActualizarDTO }) => usuariosApi.update(id, usuario),
    onSuccess: invalidate,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, cambio }: { id: number; cambio: CambiarPasswordDTO }) => usuariosApi.changePassword(id, cambio),
  })
}
