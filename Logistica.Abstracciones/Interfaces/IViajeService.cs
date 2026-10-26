using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IViajeService
    {
        Task<DisponiblesDespachoDTO> GetDisponiblesAsync();
        Task<List<ViajeDTO>> GetAllAsync(int? idEstado);
        Task<Resultado<HojaRutaDTO>> GetHojaRutaAsync(int id, int idUsuario, bool esChofer);
        Task<List<HojaRutaDTO>> GetMisViajesAsync(int idUsuarioChofer);
        Task<Resultado<HojaRutaDTO>> CreateAsync(ViajeCrearDTO viaje, int idUsuarioDespachante);
        Task<Resultado<HojaRutaItemDTO>> UpdateEstadoPaqueteAsync(int idViaje, int idPaquete, ActualizarEstadoPaqueteDTO estado, int idUsuarioChofer);
        Task<Resultado<HojaRutaDTO>> FinalizarAsync(int id, int idUsuarioChofer);
    }
}
