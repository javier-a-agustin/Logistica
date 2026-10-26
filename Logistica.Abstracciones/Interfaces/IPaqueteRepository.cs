using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IPaqueteRepository
    {
        Task<List<PaqueteDTO>> GetAllAsync(int? idEstado);
        Task<PaqueteDTO?> GetByIdAsync(int id);
        Task<PaqueteDTO?> GetByCodigoAsync(string codigoSeguimiento);
        Task<List<PaqueteDTO>> GetByIdsAsync(List<int> ids);
        Task<List<HistorialPaqueteDTO>> GetHistorialAsync(int idPaquete);
        Task<bool> ExistsCodigoAsync(string codigoSeguimiento);
        Task<PaqueteDTO> CreateAsync(PaqueteCrearDTO paquete, string codigoSeguimiento, int idUsuarioRecepcion);
    }
}
