using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IPaqueteService
    {
        Task<List<PaqueteDTO>> GetAllAsync(int? idEstado);
        Task<PaqueteDTO?> GetByIdAsync(int id);
        Task<SeguimientoDTO?> GetSeguimientoAsync(string codigoSeguimiento);
        Task<Resultado<PaqueteDTO>> CreateAsync(PaqueteCrearDTO paquete, int idUsuarioRecepcion);
    }
}
