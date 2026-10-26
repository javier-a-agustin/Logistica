import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { choferesApi } from '@/api/choferes'
import type { ChoferGuardarDTO } from '@/types'
import { viajeKeys } from './useViajes'

export const choferKeys = {
  all: ['choferes'] as const,
  list: (soloActivos: boolean) => ['choferes', 'list', soloActivos] as const,
}

export function useChoferes(soloActivos: boolean) {
  return useQuery({
    queryKey: choferKeys.list(soloActivos),
    queryFn: () => choferesApi.list(soloActivos),
    placeholderData: (previous) => previous,
  })
}

function useInvalidateChoferes() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: choferKeys.all })
    void queryClient.invalidateQueries({ queryKey: viajeKeys.disponibles() })
  }
}

export function useSaveChofer() {
  const invalidate = useInvalidateChoferes()
  return useMutation({
    mutationFn: ({ id, chofer }: { id?: number; chofer: ChoferGuardarDTO }) =>
      id ? choferesApi.update(id, chofer) : choferesApi.create(chofer),
    onSuccess: invalidate,
  })
}

export function useDeleteChofer() {
  const invalidate = useInvalidateChoferes()
  return useMutation({
    mutationFn: (id: number) => choferesApi.remove(id),
    onSuccess: invalidate,
  })
}
