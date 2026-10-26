using Logistica.Abstracciones.Comun;
using Logistica.Abstracciones.DTOs;

namespace Logistica.Abstracciones.Interfaces
{
    public interface IChoferService
    {
        Task<List<ChoferDTO>> GetAllAsync(bool soloActivos);
        Task<ChoferDTO?> GetByIdAsync(int id);
        Task<List<ChoferDTO>> GetHabilitadosAsync();
        Task<Resultado<ChoferDTO>> CreateAsync(ChoferGuardarDTO chofer);
        Task<Resultado<ChoferDTO>> UpdateAsync(int id, ChoferGuardarDTO chofer);
        Task<Resultado<bool>> DeleteAsync(int id);
    }
}
