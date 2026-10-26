import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogoApi } from '@/api/catalogo'
import type { MarcaCrearDTO, ModeloCrearDTO } from '@/types'

// Los catálogos cambian poco: se cachean más tiempo
const CATALOGO_STALE = 10 * 60 * 1000

export const catalogoKeys = {
  all: ['catalogo'] as const,
  provincias: () => ['catalogo', 'provincias'] as const,
  localidades: (idProvincia?: number) => ['catalogo', 'localidades', idProvincia ?? null] as const,
  roles: () => ['catalogo', 'roles'] as const,
  marcas: () => ['catalogo', 'marcas'] as const,
  modelos: (idMarca?: number) => ['catalogo', 'modelos', idMarca ?? null] as const,
  estadosPaquete: () => ['catalogo', 'estadosPaquete'] as const,
  estadosViaje: () => ['catalogo', 'estadosViaje'] as const,
}

export function useProvincias() {
  return useQuery({ queryKey: catalogoKeys.provincias(), queryFn: catalogoApi.provincias, staleTime: CATALOGO_STALE })
}

export function useLocalidades(idProvincia: number | undefined) {
  return useQuery({
    queryKey: catalogoKeys.localidades(idProvincia),
    queryFn: () => catalogoApi.localidades(idProvincia),
    enabled: !!idProvincia,
    staleTime: CATALOGO_STALE,
  })
}

export function useRoles() {
  return useQuery({ queryKey: catalogoKeys.roles(), queryFn: catalogoApi.roles, staleTime: CATALOGO_STALE })
}

export function useMarcas() {
  return useQuery({ queryKey: catalogoKeys.marcas(), queryFn: catalogoApi.marcas, staleTime: CATALOGO_STALE })
}

// Sin idMarca devuelve todos los modelos
export function useModelos(idMarca?: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: catalogoKeys.modelos(idMarca),
    queryFn: () => catalogoApi.modelos(idMarca),
    enabled: options.enabled ?? true,
    staleTime: CATALOGO_STALE,
  })
}

export function useEstadosPaquete() {
  return useQuery({ queryKey: catalogoKeys.estadosPaquete(), queryFn: catalogoApi.estadosPaquete, staleTime: CATALOGO_STALE })
}

export function useEstadosViaje() {
  return useQuery({ queryKey: catalogoKeys.estadosViaje(), queryFn: catalogoApi.estadosViaje, staleTime: CATALOGO_STALE })
}

export function useCreateMarca() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (marca: MarcaCrearDTO) => catalogoApi.createMarca(marca),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogoKeys.marcas() }),
  })
}

export function useCreateModelo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (modelo: ModeloCrearDTO) => catalogoApi.createModelo(modelo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo', 'modelos'] }),
  })
}
