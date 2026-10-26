using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;
using Logistica.Abstracciones.Interfaces;

namespace Logistica.Core.Service
{
    public class CatalogoService(ICatalogoRepository _catalogoRepository) : ICatalogoService
    {
        public async Task<List<ProvinciaDTO>> GetProvinciasAsync()
        {
            return await _catalogoRepository.GetProvinciasAsync();
        }

        public async Task<List<LocalidadDTO>> GetLocalidadesAsync(int? idProvincia)
        {
            return await _catalogoRepository.GetLocalidadesAsync(idProvincia);
        }

        public async Task<List<RolDTO>> GetRolesAsync()
        {
            return await _catalogoRepository.GetRolesAsync();
        }

        public async Task<List<MarcaDTO>> GetMarcasAsync()
        {
            return await _catalogoRepository.GetMarcasAsync();
        }

        public async Task<List<ModeloDTO>> GetModelosAsync(int? idMarca)
        {
            return await _catalogoRepository.GetModelosAsync(idMarca);
        }

        public async Task<List<EstadoDTO>> GetEstadosPaqueteAsync()
        {
            return await _catalogoRepository.GetEstadosPaqueteAsync();
        }

        public async Task<List<EstadoDTO>> GetEstadosViajeAsync()
        {
            return await _catalogoRepository.GetEstadosViajeAsync();
        }

        public async Task<Resultado<MarcaDTO>> CreateMarcaAsync(MarcaCrearDTO marca)
        {
            marca.NombreMarca = marca.NombreMarca.Trim();
            if (await _catalogoRepository.ExistsNombreMarcaAsync(marca.NombreMarca))
                return Resultado<MarcaDTO>.Fallo(TipoError.Conflicto, $"Ya existe la marca '{marca.NombreMarca}'");

            return Resultado<MarcaDTO>.Ok(await _catalogoRepository.CreateMarcaAsync(marca));
        }

        public async Task<Resultado<ModeloDTO>> CreateModeloAsync(ModeloCrearDTO modelo)
        {
            if (!await _catalogoRepository.ExistsMarcaAsync(modelo.IdMarca))
                return Resultado<ModeloDTO>.Fallo(TipoError.Validacion, "La marca indicada no existe");

            modelo.NombreModelo = modelo.NombreModelo.Trim();
            if (await _catalogoRepository.ExistsNombreModeloAsync(modelo.IdMarca, modelo.NombreModelo))
                return Resultado<ModeloDTO>.Fallo(TipoError.Conflicto, $"Ya existe el modelo '{modelo.NombreModelo}' para esa marca");

            return Resultado<ModeloDTO>.Ok(await _catalogoRepository.CreateModeloAsync(modelo));
        }
    }
}
