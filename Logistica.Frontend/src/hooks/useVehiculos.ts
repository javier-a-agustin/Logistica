import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { vehiculosApi } from '@/api/vehiculos'
import type { VehiculoGuardarDTO } from '@/types'
import { viajeKeys } from './useViajes'

export const vehiculoKeys = {
  all: ['vehiculos'] as const,
  list: (soloActivos: boolean) => ['vehiculos', 'list', soloActivos] as const,
}

export function useVehiculos(soloActivos: boolean) {
  return useQuery({
    queryKey: vehiculoKeys.list(soloActivos),
    queryFn: () => vehiculosApi.list(soloActivos),
    placeholderData: (previous) => previous,
  })
}

function useInvalidateVehiculos() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: vehiculoKeys.all })
    void queryClient.invalidateQueries({ queryKey: viajeKeys.disponibles() })
  }
}

export function useSaveVehiculo() {
  const invalidate = useInvalidateVehiculos()
  return useMutation({
    mutationFn: ({ id, vehiculo }: { id?: number; vehiculo: VehiculoGuardarDTO }) =>
      id ? vehiculosApi.update(id, vehiculo) : vehiculosApi.create(vehiculo),
    onSuccess: invalidate,
  })
}

export function useDeleteVehiculo() {
  const invalidate = useInvalidateVehiculos()
  return useMutation({
    mutationFn: (id: number) => vehiculosApi.remove(id),
    onSuccess: invalidate,
  })
}
