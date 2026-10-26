using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface ICatalogoService
    {
        Task<List<ProvinciaDTO>> GetProvinciasAsync();
        Task<List<LocalidadDTO>> GetLocalidadesAsync(int? idProvincia);
        Task<List<RolDTO>> GetRolesAsync();
        Task<List<MarcaDTO>> GetMarcasAsync();
        Task<List<ModeloDTO>> GetModelosAsync(int? idMarca);
        Task<List<EstadoDTO>> GetEstadosPaqueteAsync();
        Task<List<EstadoDTO>> GetEstadosViajeAsync();
        Task<Resultado<MarcaDTO>> CreateMarcaAsync(MarcaCrearDTO marca);
        Task<Resultado<ModeloDTO>> CreateModeloAsync(ModeloCrearDTO modelo);
    }
}
