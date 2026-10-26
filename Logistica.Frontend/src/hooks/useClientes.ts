import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientesApi } from '@/api/clientes'
import type { ClienteGuardarDTO } from '@/types'

export const clienteKeys = {
  all: ['clientes'] as const,
  list: (busqueda: string) => ['clientes', 'list', busqueda] as const,
}

export function useClientes(busqueda: string) {
  return useQuery({
    queryKey: clienteKeys.list(busqueda),
    queryFn: () => clientesApi.list(busqueda || undefined),
    placeholderData: (previous) => previous,
  })
}

// Búsqueda puntual a pedido del usuario (por eso es una mutación). Un ApiError 404 = cliente no registrado
export function useBuscarClientePorDocumento() {
  return useMutation({
    mutationFn: ({ tipoDocumento, numeroDocumento }: { tipoDocumento: string; numeroDocumento: string }) =>
      clientesApi.getByDocumento(tipoDocumento, numeroDocumento),
  })
}

export function useSaveCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cliente }: { id?: number; cliente: ClienteGuardarDTO }) =>
      id ? clientesApi.update(id, cliente) : clientesApi.create(cliente),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clienteKeys.all }),
  })
}

export function useDeleteCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clientesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clienteKeys.all }),
  })
}
