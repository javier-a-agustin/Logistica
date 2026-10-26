using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IVehiculoRepository
    {
        Task<List<VehiculoDTO>> GetAllAsync(bool soloActivos);
        Task<VehiculoDTO?> GetByIdAsync(int id);
        Task<bool> ExistsPatenteAsync(string patente, int? excluirIdVehiculo);
        Task<VehiculoDTO> CreateAsync(VehiculoGuardarDTO vehiculo);
        Task<VehiculoDTO?> UpdateAsync(int id, VehiculoGuardarDTO vehiculo);
        Task<bool> SetActivoAsync(int id, bool activo);
        Task<List<int>> GetIdsEnViajeActivoAsync();
    }
}
