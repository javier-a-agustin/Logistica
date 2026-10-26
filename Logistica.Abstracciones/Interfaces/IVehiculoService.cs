using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IVehiculoService
    {
        Task<List<VehiculoDTO>> GetAllAsync(bool soloActivos);
        Task<VehiculoDTO?> GetByIdAsync(int id);
        Task<List<VehiculoDTO>> GetDisponiblesAsync();
        Task<Resultado<VehiculoDTO>> CreateAsync(VehiculoGuardarDTO vehiculo);
        Task<Resultado<VehiculoDTO>> UpdateAsync(int id, VehiculoGuardarDTO vehiculo);
        Task<Resultado<bool>> DeleteAsync(int id);
    }
}
