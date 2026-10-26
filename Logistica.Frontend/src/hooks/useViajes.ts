import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { viajesApi } from '@/api/viajes'
import type { ActualizarEstadoPaqueteDTO, ViajeCrearDTO } from '@/types'

export const viajeKeys = {
  all: ['viajes'] as const,
  list: (idEstado?: number) => ['viajes', 'list', idEstado ?? null] as const,
  hojaRuta: (id: number) => ['viajes', 'hojaRuta', id] as const,
  disponibles: () => ['viajes', 'disponibles'] as const,
  mis: () => ['viajes', 'mis'] as const,
}

// Un cambio en un viaje impacta en paquetes, vehículos y choferes disponibles
function invalidateViajes(queryClient: QueryClient) {
  for (const queryKey of [viajeKeys.all, ['paquetes'], ['vehiculos'], ['choferes']]) {
    void queryClient.invalidateQueries({ queryKey })
  }
}

export function useViajes(idEstado?: number) {
  return useQuery({
    queryKey: viajeKeys.list(idEstado),
    queryFn: () => viajesApi.list(idEstado),
    placeholderData: (previous) => previous,
  })
}

export function useHojaRuta(id: number) {
  return useQuery({
    queryKey: viajeKeys.hojaRuta(id),
    queryFn: () => viajesApi.hojaRuta(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useDisponiblesDespacho() {
  return useQuery({ queryKey: viajeKeys.disponibles(), queryFn: viajesApi.disponibles })
}

export function useMisViajes() {
  return useQuery({ queryKey: viajeKeys.mis(), queryFn: viajesApi.misViajes })
}

export function useCreateViaje() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (viaje: ViajeCrearDTO) => viajesApi.create(viaje),
    onSuccess: (hojaRuta) => {
      queryClient.setQueryData(viajeKeys.hojaRuta(hojaRuta.idViaje), hojaRuta)
      invalidateViajes(queryClient)
    },
  })
}

export function useUpdateEstadoPaquete(idViaje: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idPaquete, estado }: { idPaquete: number; estado: ActualizarEstadoPaqueteDTO }) =>
      viajesApi.updateEstadoPaquete(idViaje, idPaquete, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: viajeKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['paquetes'] })
    },
  })
}

export function useFinalizarViaje() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idViaje: number) => viajesApi.finalizar(idViaje),
    onSuccess: (hojaRuta) => {
      queryClient.setQueryData(viajeKeys.hojaRuta(hojaRuta.idViaje), hojaRuta)
      invalidateViajes(queryClient)
    },
  })
}
