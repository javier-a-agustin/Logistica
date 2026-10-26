using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface ICatalogoRepository
    {
        Task<List<ProvinciaDTO>> GetProvinciasAsync();
        Task<List<LocalidadDTO>> GetLocalidadesAsync(int? idProvincia);
        Task<List<RolDTO>> GetRolesAsync();
        Task<List<MarcaDTO>> GetMarcasAsync();
        Task<List<ModeloDTO>> GetModelosAsync(int? idMarca);
        Task<List<EstadoDTO>> GetEstadosPaqueteAsync();
        Task<List<EstadoDTO>> GetEstadosViajeAsync();
        Task<RolDTO?> GetRolByIdAsync(int idRol);
        Task<bool> ExistsLocalidadAsync(int idLocalidad);
        Task<bool> ExistsMarcaAsync(int idMarca);
        Task<bool> ExistsModeloAsync(int idModelo);
        Task<bool> ExistsNombreMarcaAsync(string nombreMarca);
        Task<bool> ExistsNombreModeloAsync(int idMarca, string nombreModelo);
        Task<MarcaDTO> CreateMarcaAsync(MarcaCrearDTO marca);
        Task<ModeloDTO> CreateModeloAsync(ModeloCrearDTO modelo);
    }
}
