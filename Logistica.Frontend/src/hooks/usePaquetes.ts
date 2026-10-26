import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paquetesApi } from '@/api/paquetes'
import type { PaqueteCrearDTO } from '@/types'
import { viajeKeys } from './useViajes'

export const paqueteKeys = {
  all: ['paquetes'] as const,
  list: (idEstado?: number) => ['paquetes', 'list', idEstado ?? null] as const,
  seguimiento: (codigo: string) => ['paquetes', 'seguimiento', codigo] as const,
}

export function usePaquetes(idEstado?: number) {
  return useQuery({
    queryKey: paqueteKeys.list(idEstado),
    queryFn: () => paquetesApi.list(idEstado),
    placeholderData: (previous) => previous,
  })
}

export function useSeguimiento(codigo: string) {
  return useQuery({
    queryKey: paqueteKeys.seguimiento(codigo),
    queryFn: () => paquetesApi.seguimiento(codigo),
    enabled: !!codigo,
  })
}

export function useCreatePaquete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (paquete: PaqueteCrearDTO) => paquetesApi.create(paquete),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paqueteKeys.all })
      void queryClient.invalidateQueries({ queryKey: viajeKeys.disponibles() })
    },
  })
}
