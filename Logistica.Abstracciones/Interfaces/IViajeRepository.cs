using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IViajeRepository
    {
        Task<List<ViajeDTO>> GetAllAsync(int? idEstado);
        Task<List<int>> GetIdsByUsuarioChoferAsync(int idUsuarioChofer, int idEstadoViaje);
        Task<HojaRutaDTO?> GetHojaRutaAsync(int id);
        Task<int> CreateAsync(ViajeCrearDTO viaje, DateTime fechaSalida, int idUsuarioDespachante);
        Task UpdateEstadoPaqueteAsync(int idPaquete, int idEstadoPaquete, int idUsuario, string? observacion);
        Task UpdateEstadoViajeAsync(int id, int idEstadoViaje);
    }
}
