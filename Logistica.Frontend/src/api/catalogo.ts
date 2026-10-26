import type {
  EstadoDTO,
  LocalidadDTO,
  MarcaCrearDTO,
  MarcaDTO,
  ModeloCrearDTO,
  ModeloDTO,
  ProvinciaDTO,
  RolDTO,
} from '@/types'
import { api } from './client'

// CatalogoController
export const catalogoApi = {
  provincias: () => api.get<ProvinciaDTO[]>('/Catalogo/Provincias'),
  localidades: (idProvincia?: number) =>
    api.get<LocalidadDTO[]>('/Catalogo/Localidades', { query: { idProvincia } }),
  roles: () => api.get<RolDTO[]>('/Catalogo/Roles'),
  marcas: () => api.get<MarcaDTO[]>('/Catalogo/Marcas'),
  modelos: (idMarca?: number) => api.get<ModeloDTO[]>('/Catalogo/Modelos', { query: { idMarca } }),
  estadosPaquete: () => api.get<EstadoDTO[]>('/Catalogo/EstadosPaquete'),
  estadosViaje: () => api.get<EstadoDTO[]>('/Catalogo/EstadosViaje'),
  createMarca: (marca: MarcaCrearDTO) => api.post<MarcaDTO>('/Catalogo/Marcas', marca),
  createModelo: (modelo: ModeloCrearDTO) => api.post<ModeloDTO>('/Catalogo/Modelos', modelo),
}
